import { request } from 'utils/api';
import BaseStore from 'stores/BaseStore';

export default class ProductsStore extends BaseStore {

  async fetch(id) {
    const { data } = request({
      method: 'GET',
      path: `/1/products/${id}`
    });
    return data;
  }

  async search(params = {}) {
    const { page = 1, limit, ...rest } = params;
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: {
        limit,
        skip: (page - 1) * limit,
        ...rest,
      }
    });
  }

  async create(params = {}) {
    return await request({
      method: 'POST',
      path: '/1/products',
      body: params
    });
  }

  async update(item) {
    const { id, ...body } = item;
    return await request({
      method: 'PATCH',
      path: `/1/products/${id}`,
      body,
    });
  }

  async delete(item) {
    return await request({
      method: 'DELETE',
      path: `/1/products/${item.id}`
    });
  }

}
