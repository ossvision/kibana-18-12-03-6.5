import getRequestParams from './series/get_request_params';
import handleResponseBody from './series/handle_response_body';
import handleErrorResponse from './handle_error_response';
import getAnnotations from './get_annotations';
import { set } from 'lodash';
export function getSeriesData(req, panel) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('data');
  const bodies = panel.series.map(series => getRequestParams(req, panel, series));
  const params = {
    body: bodies.reduce((acc, items) => acc.concat(items), [])
  };
  return callWithRequest(req, 'msearch', params)
    .then(resp => {
      const series = resp.responses.map(handleResponseBody(panel));
      return {
        [panel.id]: {
          id: panel.id,
          series: series.reduce((acc, series) => acc.concat(series), [])
        },
        meta: { response: resp }
      };
    })
    .then(resp => {
      if (!panel.annotations || panel.annotations.length === 0) return resp;
      return getAnnotations(req, panel).then(annotations => {
        resp[panel.id].annotations = annotations;
        return resp;
      });
    })
    .then(resp => {
      set(resp, 'type', panel.type);
      set(resp, 'meta.request', bodies);
      return resp;
    })
    .catch(handleErrorResponse(panel, bodies));
}

