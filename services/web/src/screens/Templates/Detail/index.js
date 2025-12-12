import { Link, Route, Routes } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Content from './Content';
import Edit from './Edit';
import Overview from './Overview';
import Preview from './Preview';

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
        <Route path="/templates/:id/content" render={Content} exact />
        <Route path="/templates/:id/preview" render={Preview} exact />
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
