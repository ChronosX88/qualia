import { CSVS } from '@fetsorn/csvs-js';

async function grep(contentFile, patternFile, isInverted = false) {
  const wasm = await import('@fetsorn/wasm-grep');

  return wasm.grep(
    contentFile,
    patternFile,
    isInverted,
  );
}

const readFile = (filepath) => new Promise((res, rej) => {
  const channel = new MessageChannel();

  channel.port1.onmessage = ({ data }) => {
    channel.port1.close();

    if (data.error) {
      rej(data.error);
    } else {
      res(data.result);
    }
  };

  postMessage({ action: 'readFile', filepath }, [channel.port2]);
});

async function select(message) {
  try {
    let result;

    try {
      const searchParams = new URLSearchParams(message.data.searchParams);

      result = await (new CSVS({ readFile, grep })).select(searchParams);
    } catch (e) {
      result = [];
    }

    message.ports[0].postMessage({ result });
  } catch (e) {
    message.ports[0].postMessage({ error: e });
  }
}

onmessage = async (message) => {
  if (message.data.action === 'select') {
    await select(message);
  }
};
