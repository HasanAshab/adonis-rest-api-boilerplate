import DB from 'DB'
import Storage from 'Storage'
import User from '~/app/models/User'
import Category from '~/app/models/Category'

describe('Category', () => {
  let admin
  let token

  beforeAll(async () => {
    await DB.connect()
  })

  beforeEach(async (config) => {
    Storage.mockClear()
    await DB.reset(['User', 'Category'])
    if (config.user !== false) {
      admin = await User.factory().withRole('admin').create()
      token = admin.createToken()
    }
  })

  test("Shouldn't accessable by general users", { user: false }, async ({ client, expect }) => {
    const user = await User.factory().create()
    const userToken = user.createToken()
    const requests = [
      request.get('/admin/categories'),
      request.post('/admin/categories'),
      request.get('/admin/categories/foo-user-id'),
      request.patch('/admin/categories/foo-user-id'),
      request.delete('/admin/categories/foo-user-id'),
    ]
    const responses = await Promise.all(requests.map((request) => request.actingAs(userToken)))
    const isNotAccessable = responses.every((response) => response.statusCode === 403)
    expect(isNotAccessable).toBeTrue()
  })

  test('Should get all categories', async ({ client, expect }) => {
    const categories = await Category.factory().count(3).create()
    const response = await client.get('/api/v1/admin/categories').loginAs(user)
    response.assertStatus(200)
    expect(response.body.data).toEqualDocument(categories)
  })

  test('Should create category', async ({ client, expect }) => {
    const response = await client
      .post('/api/v1/admin/categories')
      .loginAs(user)
      .multipart({
        name: 'foo bar',
        slug: 'foo-bar',
        icon: fakeFilePath('image.png'),
      })

    response.assertStatus(201)
    expect(await Category.findOne({ slug: 'foo-bar' })).not.toBeNull()
    Storage.assertStoredCount(1)
    Storage.assertStored('image.png')
  })

  test('Should create category without icon', async ({ client, expect }) => {
    const response = await client.post('/api/v1/admin/categories').loginAs(user).multipart({
      name: 'foo bar',
      slug: 'foo-bar',
    })

    response.assertStatus(201)
    expect(await Category.findOne({ slug: 'foo-bar' })).not.toBeNull()
    Storage.assertNothingStored()
  })

  test("Shouldn't create category with existing slug", async ({ client, expect }) => {
    const category = await Category.factory().create()
    const response = await client.post('/api/v1/admin/categories').loginAs(user).multipart({
      name: 'foo bar',
      slug: category.slug,
    })
    response.assertStatus(400)
  })

  it.only('Should get category by id', async ({ client, expect }) => {
    const category = await Category.factory().create()
    const response = await client.get(`/api/v1/admin/categories/${category._id}`).loginAs(user)
    response.assertStatus(200)
    expect(response.body.data).toEqualDocument(category)
  })

  test('Should update category', async ({ client, expect }) => {
    let category = await Category.factory().create()
    const response = await client
      .patch(`/api/v1/admin/categories/${category._id}`)
      .loginAs(user)
      .multipart({
        name: 'foo bar',
        slug: 'foo-bar',
      })
    category = await Category.findById(category._id)
    response.assertStatus(200)
    expect(category.name).toBe('foo bar')
    expect(category.slug).toBe('foo-bar')
  })

  test('Should update category with icon', async ({ client, expect }) => {
    let category = await Category.factory().create()
    const response = await client
      .patch(`/api/v1/admin/categories/${category._id}`)
      .loginAs(user)
      .multipart({
        name: 'foo bar',
        slug: 'foo-bar',
        icon: fakeFilePath('image.png'),
      })
    category = await Category.findById(category._id)
    response.assertStatus(200)
    expect(category.name).toBe('foo bar')
    expect(category.slug).toBe('foo-bar')
    Storage.assertStoredCount(1)
    Storage.assertStored('image.png')
  })

  test("Shouldn't update category with existing slug", async ({ client, expect }) => {
    const categories = await Category.factory().count(2).create()
    const response = await client
      .patch(`/api/v1/admin/categories/${categories[0]._id}`)
      .loginAs(user)
      .multipart({
        name: 'foo bar',
        slug: categories[1].slug,
      })
    response.assertStatus(400)
  })

  test('Should delete category', async ({ client, expect }) => {
    const category = await Category.factory().create()
    const response = await client.delete(`/api/v1/admin/categories/${category._id}`).loginAs(user)
    response.assertStatus(204)
    expect(await Category.findById(category._id)).toBeNull()
  })
})
