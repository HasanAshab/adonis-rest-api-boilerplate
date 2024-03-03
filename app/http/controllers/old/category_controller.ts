import Controller from '~/app/http/controllers/controller'
import { RequestHandler } from '~/core/decorators'
import { Request, AuthenticRequest, Response } from '~/core/express'
import Category, { ICategory } from '~/app/models/category'
//import type { ICategory } from "~/app/models/category";

import CategoryRequest from '~/app/http/requests/v1/category/category_request'
import UpdateCategoryRequest from '~/app/http/requests/v1/category/update_category_request'
import URL from 'url'

export default class CategoryController extends Controller {
  @RequestHandler
  async index(req: AuthenticRequest) {
    return await Category.find().lean()
  }

  @RequestHandler
  async show(rawCategory: ICategory) {
    return rawCategory
  }

  @RequestHandler
  async store(req: CategoryRequest, res: Response) {
    const category = new Category(req.body)
    await category.media().withTag('icon').attach(req.file('icon')).storeRef()
    const { _id } = await category.save()
    const categoryUrl = URL.route('v1_categories.show', { id: _id })
    res.header('Location', categoryUrl).status(201).message('Category successfully created!')
  }

  @RequestHandler
  async update(req: UpdateCategoryRequest, res: Response, id: string) {
    const category = await Category.findByIdAndUpdateOrFail(id, req.body)
    if (req.hasFile('icon')) {
      await category.media().replaceBy(req.file('icon'))
    }
    return 'Category updated!'
  }

  @RequestHandler
  async delete(res: Response, id: string) {
    await Category.deleteOneByIdOrFail(id)
    res.sendStatus(204)
  }
}
