import { request } from 'utils/api';
import BaseStore from './BaseStore';

export default class ShopsStore extends BaseStore {

  async fetch(id) {
    return await request({
      method: 'GET',
      path: `/1/shops/${id}`
    });
  }

  async search(params = {}) {
    const { page = 1, limit, ...rest } = params;
    return await request({
      method: 'POST',
      path: '/1/shops/search',
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
      path: '/1/shops',
      body: params
    });
  }

  async update(item) {
    const { id, ...body } = item;
    return await request({
      method: 'PATCH',
      path: `/1/shops/${id}`,
      body,
    });
  }

  async delete(item) {
    return await request({
      method: 'DELETE',
      path: `/1/shops/${item.id}`
    });
  }
}
