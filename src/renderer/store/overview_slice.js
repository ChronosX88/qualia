import { API, schemaRoot } from 'lib/api';
// import { OverviewType } from './types.js';

// pick a param to group data by
function getDefaultGroupBy(
  schema,
  data,
  searchParams,
) {
  // fallback to groupBy param from the search query
  if (searchParams.has('.')) {
    const groupBy = searchParams.get('.');

    return groupBy;
  }

  let groupBy;

  const car = data[0] ?? {};

  // fallback to first date param present in data
  groupBy = Object.keys(schema).find((branch) => (
    schema[branch].type === 'date'
      && Object.prototype.hasOwnProperty.call(car, branch)
  ));

  // fallback to first param present in data
  if (!groupBy) {
    groupBy = Object.keys(schema).find((branch) => (
      Object.prototype.hasOwnProperty.call(car, branch)
    ));
  }

  // fallback to first date param present in schema
  if (!groupBy) {
    groupBy = Object.keys(schema).find(
      (branch) => schema[branch].type === 'date',
    );
  }

  // fallback to first param present in schema
  if (!groupBy) {
    [groupBy] = Object.keys(schema);
  }

  // unreachable with a valid scheme
  if (!groupBy) {
    throw Error('failed to find default groupBy in the schema');
  }

  return groupBy;
}

export function queriesToParams(queries) {
  const searchParams = new URLSearchParams();

  Object.keys(queries).map((key) => (queries[key] !== '' ? searchParams.set(key, queries[key]) : null));

  return searchParams;
}

function paramsToQueries(searchParams) {
  const searchParamsObject = Array.from(searchParams).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  );

  const queries = Object.fromEntries(
    Object.entries(searchParamsObject).filter(
      ([key]) => key !== '.' && key !== '~' && key !== '-',
    ),
  );

  return queries;
}

export const createOverviewSlice = (set, get) => ({
  schema: {},

  overview: [],

  isInitialized: false,

  isView: false,

  repoRoute: undefined,

  repoUUID: undefined,

  repoName: undefined,

  base: undefined,

  initialize: async (repoRoute, search) => {
    const searchParams = new URLSearchParams(search);

    let repoUUID;

    let repoName;

    let isView = false;

    if (searchParams.has('~')) {
      // if uri specifies a remote
      // try to clone remote to store
      // where repo uuid is a digest of remote
      // and repo name is uri-encoded remote
      const remote = searchParams.get('~');

      const token = searchParams.get('-') ?? '';

      const { digestMessage } = await import('@fetsorn/csvs-js');

      repoUUID = digestMessage(remote);

      repoName = encodeURIComponent(remote);

      isView = true;

      const api = new API(repoUUID);

      await api.cloneView(remote, token);
    } else if (repoRoute === undefined) {
      repoUUID = 'root';

      // eslint-disable-next-line
      if (__BUILD_MODE__ !== 'server') {
        const apiRoot = new API('root');

        await apiRoot.ensure(schemaRoot);
      }
    } else {
      repoName = repoRoute;

      const apiRoot = new API('root');

      const searchParamsReponame = new URLSearchParams();

      searchParamsReponame.set('_', 'reponame');

      searchParamsReponame.set('reponame', repoName);

      try {
        const [{ UUID }] = await apiRoot.select(searchParamsReponame);

        repoUUID = UUID;
      } catch {
        // if repoRoute is not in root database
        // try to decode repoRoute as a view url
        // and set uuid to a digest of repoRoute
        const remote = repoRoute;

        const { digestMessage } = await import('@fetsorn/csvs-js');

        repoUUID = digestMessage(remote);

        repoName = encodeURIComponent(remote);

        isView = true;
      }
    }

    const api = new API(repoUUID);

    const queries = paramsToQueries(searchParams);

    // const overviewTypeParam = searchParams.get(
    //   'overviewType',
    // );

    // const overviewType = overviewTypeParam
    //   ? OverviewType[overviewTypeParam]
    //   : get().overviewType;

    const groupBy = searchParams.get(
      '.',
    ) ?? '';

    const schema = await api.readSchema();

    const base = Object.keys(schema).find((branch) => !Object.prototype.hasOwnProperty.call(schema[branch], 'trunk'));

    set({
      schema,
      base,
      queries,
      groupBy,
      isView,
      isInitialized: true,
      repoUUID,
      repoName,
    });
  },

  onQueries: async () => {
    if (get().isInitialized) {
      const api = new API(get().repoUUID);

      const schema = await api.readSchema();

      const base = Object.prototype.hasOwnProperty.call(schema, get().groupBy)
        ? get().base
        : Object.keys(schema).find((branch) => !Object.prototype.hasOwnProperty.call(schema[branch], 'trunk'));

      const searchParams = queriesToParams(get().queries);

      searchParams.set('_', base);

      set({
        base, schema, overview: [],
      });

      const overview = await api.select(searchParams);

      const groupBy = Object.prototype.hasOwnProperty.call(schema, get().groupBy)
        ? get().groupBy
        : getDefaultGroupBy(schema, overview, searchParams);

      set({
        overview, groupBy,
      });
    }
  },

  onChangeBase: async (base) => {
    const searchParams = queriesToParams(get().queries);

    set({ base });

    searchParams.set('_', base);

    const api = new API(get().repoUUID);

    const overview = await api.select(searchParams);

    set({ overview });
  },

  setRepoUUID: async (repoUUID) => {
    let repoName;

    if (repoUUID === 'root' || get().isView) {
      // leave repoName as undefined
    } else {
      const api = new API('root');

      const searchParams = new URLSearchParams();

      searchParams.set('_', 'reponame');

      searchParams.set('reponame', repoUUID);

      const [entry] = await api.select(searchParams);

      repoName = entry.reponame;
    }

    set({
      repoName, repoUUID, queries: {}, entry: undefined,
    });
  },

  setRepoName: async (repoName) => {
    const api = new API('root');

    const searchParams = new URLSearchParams();

    searchParams.set('_', 'reponame');

    searchParams.set('reponame', repoName);

    const [entry] = await api.select(searchParams);

    if (entry === undefined) {
      return;
    }

    const repoUUID = entry.UUID;

    set({
      repoName, repoUUID, queries: {}, entry: undefined,
    });
  },
});
