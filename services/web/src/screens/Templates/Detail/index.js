import { Link, Routes, Route } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';
import Preview from './Preview';
import Edit from './Edit';

export default function TemplateDetail() {
  const Loader = usePageLoader(async (params) => {
    const { data } = await request({
      method: 'GET',
      path: `/1/templates/${params.id}`,
    });
    return {
      template: data,
    };
  });

  return (
    <Loader
      notFound={
        <NotFound
          link={<Link to="/templates">Templates</Link>}
          message="Sorry that template wasn't found."
        />
      }>
      <Routes>
        <Route path="/templates/:id" render={Overview} exact />
        <Route path="/templates/:id/edit" render={Edit} exact />
        <Route path="/templates/:id/preview" render={Preview} exact />
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
