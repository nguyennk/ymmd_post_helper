import React from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import sha1 from 'sha1';
import map from 'lodash/fp/map';
import split from 'lodash/fp/split';
import compact from 'lodash/fp/compact';
import forEach from 'lodash/fp/forEach';
import get from 'lodash/fp/get';

export const POST_FORMAT = {
  FEATURES: `{{replace}}`,
  MATERIALS: `<h3>Materials</h3>
{{replace}}`,
  CONTENT: `<h3>Package Content</h3>
{{replace}}`,
  NOTES: `<h3>Notes</h3>
{{replace}}`,
  DETAILS: `{{replace}}`,
  SIZE: `<h3>Size Table</h3>
{{replace}}`,
  CARE: `<h3>Care Instructions</h3>
{{replace}}`
};

const SOCK_SIZE_LIST = {
  'Sock Size': ['34-39', '35-40', '40-46', '39-47'],
  'US Sock Size': ['5-7', '5-7½', '7½-12', '7-13']
};

export const sockSizeConverter = sizeRanges => {
  const SOCK_SIZE_TYPES = ['Sock Size', 'EUR Sock Size', 'US Sock Size'];
  const SizeValues = {
    'Sock Size': [],
    'EUR Sock Size': [],
    'US Sock Size': []
  };
  forEach(sizeRange => {
    const SockSizeArray = get('Sock Size', SOCK_SIZE_LIST);
    const USSockSizeArray = get('US Sock Size', SOCK_SIZE_LIST);
    const index = SockSizeArray.indexOf(sizeRange);
    forEach(sizeType => {
      switch (sizeType) {
        case 'EUR Sock Size':
          SizeValues[sizeType].push(SockSizeArray[index]);
          break;
        case 'US Sock Size':
          SizeValues[sizeType].push(USSockSizeArray[index]);
          break;
        default:
          SizeValues[sizeType].push(SockSizeArray[index]);
          break;
      }
    }, SOCK_SIZE_TYPES);
  }, sizeRanges);
  return SizeValues;
};

export const SIZE_TABLE = {
  SOCK: `
  <table border="1" class="size-table">
    <tbody>
      {{replace}}
    </tbody>
  </table>
  `
};

export const imageWrapper = src =>
  `<p><img class="custom-product-image lazy" data-src="${src}"></p>`;

export const processRow = row => {
  if (row.indexOf('imgur.com') >= 0) {
    return imageWrapper(row);
  } else if (row.startsWith('H: ')) {
    return `<h3>${row.substring(3)}</h3>`;
  } else {
    return `<p>${row}</p>`;
  }
};

export const processParagraph = raw => {
  const paraArray = split('\n', raw);
  const formmatedArray = map(processRow, compact(paraArray));
  return formmatedArray.join('\n');
};

export const CDNR_NAME = 'ymmd-store';
export const CDNR_KEY = '475949913728291';
export const CDNR_SEC = 'H1F9D1Y_FPLmS7Vtc1ErcR1sqIM';
export const CIM_TOKEN = 'adngsoblvo';
export const IUR_TOKEN = '38bb0784c221d05';
export const WATERMARK_LOGO =
  'https://res.cloudinary.com/ymmd-store/image/authenticated/s--KIF9t7Br--/v1575474116/YMMD/swp4brvvhlwrlm9vn3tn.png';

export const generateSignature = timestamp => {
  const stringToHex = `timestamp=${timestamp}${CDNR_SEC}`;
  const hex = sha1(stringToHex);
  return hex;
};

export const uploadPhoto = async url => {
  let formData = new FormData();
  const timestamp = Math.round(Date.now() / 1000);
  formData.append('file', url);
  formData.append('api_key', CDNR_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', generateSignature(timestamp));
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CDNR_NAME}/upload`,
    {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {},
      referrer: 'no-referrer', // no-referrer, *client
      body: formData
    }
  );
  return await response.json(); // parses JSON response into native JavaScript objects
};

export const reuploadImgur = async url => {
  let formData = new FormData();
  formData.append('image', url);
  const response = await fetch(`https://api.imgur.com/3/image`, {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${IUR_TOKEN}`
    },
    referrer: 'no-referrer', // no-referrer, *client
    body: formData
  });
  return await response.json(); // parses JSON response into native JavaScript objects
};

export const TabPanel = ({ value, index, children }) =>
  value === index ? <div>{children}</div> : <div />;

export const RootContainer = styled.div`
  text-align: center;
  > h3 {
    margin-bottom: 50px;
    font-size: 2em;
  }

  #image-float-div {
    max-width: 800px;
    margin: 25px auto 0;
  }
`;

export const ContainerDiv = styled(Paper)`
  padding: 10px 15px;
`;

export const ContentDiv = styled.div`
  color: black;
  min-height: 50px;
  margin: 15px auto;
  padding: 15px 25px;
  .editor-button {
  }
  .section-header-input {
    width: 100%;
    background: white;
    &:not(:first-child) {
      margin-top: 15px;
    }
  }
  h4 {
    margin-top: 0;
    text-align: center;
  }
  .section-result-input {
    width: 100%;
    background: #ffffffab;
  }
  .previewContainer {
      padding: 10px 15px;
      background: #ececec;
      margin-top: 15px;
      min-height: 250px;
      > h3 {
        color: #b3b1b1;
      }
    }
  }
`;
