import Storage from 'Storage'
import fs from 'fs'

jest.unmock('Storage')

describe('storage', () => {
  test('Should store file', async ({ client, expect }) => {
    const file = {
      name: 'test.png',
      data: fs.readFileSync(fakeFilePath('image.png').path),
    }
    const path = await Storage.putFile('public/uploads', file)
    const data = fs.readFileSync(path)
    expect(fs.existsSync(path)).toBeTrue()
    expect(data).toStrictEqual(file.data)
    fs.unlinkSync(path)
  })
})
