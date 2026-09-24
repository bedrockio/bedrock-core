import { get } from 'lodash';

import { JumpLink } from 'components/Link';
import Code from 'components/Code';
import { expandRef, getRoutePath } from 'docs/utils';

import Properties from './Properties';
import { useDocs } from '../utils/context';

const MIME = 'application/json';

export default function RouteResponse(props) {
  const { route } = props;

  const { docs, visitedComponents } = useDocs();

  const responsesPath = [...getRoutePath(route), 'responses'];
  const responses = get(docs, responsesPath);

  if (!responses) {
    return null;
  }

  function renderSchema(schema, path) {
    if (schema.$ref) {
      visitedComponents.add(schema.$ref);
      const { name } = expandRef(schema.$ref);
      return (
        <p className="text-sm">
          Returns: <JumpLink to={name}>{name}</JumpLink>
        </p>
      );
    } else if (schema.properties) {
      return <Properties path={path} />;
    }
  }

  function renderVariants(schema, path) {
    if (schema.oneOf) {
      return schema.oneOf.map((variant, i) => {
        return (
          <div key={i} className="flex flex-col gap-2">
            {variant.description && (
              <p className="text-muted-foreground text-sm">
                {variant.description}
              </p>
            )}
            {renderSchema(variant, [...path, 'oneOf', i.toString()])}
          </div>
        );
      });
    }
    return renderSchema(schema, path);
  }

  function renderExamples(examples = {}) {
    return Object.entries(examples).map(([key, example]) => {
      return (
        <div key={key} className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">
            Example{example.summary ? `: ${example.summary}` : ''}
          </p>
          <Code language="json">{JSON.stringify(example.value, null, 2)}</Code>
        </div>
      );
    });
  }

  function renderOtherTypes(content = {}) {
    const types = Object.keys(content).filter((type) => type !== MIME);
    if (types.length) {
      return (
        <p className="text-sm">
          Also returns:{' '}
          {types.map((type) => (
            <code key={type}>{type}</code>
          ))}
        </p>
      );
    }
  }

  const statuses = Object.keys(responses).sort();

  return (
    <div className="flex flex-col gap-4">
      <h4>Responses:</h4>
      {statuses.map((status) => {
        const { content } = responses[status];
        const entry = content?.[MIME];
        const schemaPath = [
          ...responsesPath,
          status,
          'content',
          MIME,
          'schema',
        ];
        const isOneOf = !!entry?.schema?.oneOf;
        return (
          <div key={status} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <code>{status}</code>
              {!isOneOf && (
                <span className="text-sm">{responses[status].description}</span>
              )}
            </div>
            {entry?.schema && renderVariants(entry.schema, schemaPath)}
            {renderExamples(entry?.examples)}
            {renderOtherTypes(content)}
          </div>
        );
      })}
    </div>
  );
}
