import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import compose from 'recompose/compose';
import setDisplayName from 'recompose/setDisplayName';
import withStateHandlers from 'recompose/withStateHandlers';
import get from 'lodash/fp/get';
import getOr from 'lodash/fp/getOr';
import withHandlers from 'recompose/withHandlers';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import {
  uploadPhoto,
  ContentDiv,
  ContainerDiv,
  reuploadImgur
} from '../../../../helper';

const PureImageUploader = ({
  isUploading,
  handlePaste,
  handleBrowse,
  url,
  imageCode,
  updateUrl,
  uploadUrl
}) => (
  <ContainerDiv>
    <h4>Image Uploader</h4>
    <ContentDiv>
      <TextField
        value={url}
        onChange={updateUrl}
        onPaste={handlePaste}
        className="section-header-input"
        label="Paste clipboard or url"
        variant="outlined"
        disabled={isUploading}
        multiline
        rows={3}
      />
    </ContentDiv>
    <input
      accept="image/*"
      className="upload-input"
      onChange={handleBrowse}
      id="contained-button-file"
      // multiple
      type="file"
    />
    <label htmlFor="contained-button-file">
      <Button
        variant="contained"
        component="span"
        color="default"
        className="editor-button-default"
        disabled={isUploading}>
        {isUploading ? 'Uploading' : 'Browse'}
      </Button>
    </label>
    <Button
      variant="contained"
      color="primary"
      className="editor-button"
      startIcon={<CloudUploadIcon />}
      onClick={uploadUrl}
      disabled={isUploading}>
      {isUploading ? 'Uploading' : 'Upload'}
    </Button>
    <ContentDiv id="result-container">
      <TextField
        className="section-result-input"
        value={imageCode}
        label="Formatted URL"
        multiline
        variant="outlined"
        rows={3}
      />
      <div className="previewContainer">
        <h3>Preview</h3>
        <div className="custom-post-format">
          <div
            dangerouslySetInnerHTML={{
              __html: `<img class='custom-product-image' src='${imageCode}' alt=''/>`
            }}
          />
        </div>
      </div>
    </ContentDiv>
  </ContainerDiv>
);

const mapState = withStateHandlers(
  () => ({
    url: '',
    imageCode: '',
    isUploading: false
  }),
  {
    updateUploadState: () => value => ({
      isUploading: value
    }),
    updateUrl: () => e => ({
      url: e.target.value
    }),
    updateImageCode: () => code => ({
      imageCode: code
    })
  }
);

const getImageWrapper = (link, fileName) => link;
//`<img class='custom-product-image' src='${link}' alt='${fileName}'/>`;

const mapUploadHandler = withHandlers({
  uploadCloudinary: ({ updateImageCode, updateUploadState }) => async file => {
    updateUploadState(true);
    updateImageCode('');
    const result = await uploadPhoto(file);
    const uploadedUrl = get('secure_url', result);
    const imgUrResult = await reuploadImgur(uploadedUrl);
    const imgurUrl = get('data.link', imgUrResult);
    const fileName = getOr('', 'original_filename', result);
    const formattedCode = getImageWrapper(imgurUrl, fileName);
    updateImageCode(formattedCode);
    updateUploadState(false);
  }
});

const mapHandler = withHandlers({
  uploadUrl: ({ url, uploadCloudinary }) => async () => {
    await uploadCloudinary(url);
  },
  handleBrowse: ({ uploadCloudinary }) => async data => {
    const file = get('target.files[0]', data);
    await uploadCloudinary(file);
  },
  handlePaste: ({ uploadCloudinary }) => async ({ clipboardData }) => {
    const item = get('items[0]', clipboardData);
    const itemSecond = get('items[1]', clipboardData);
    const fileType = get('type', item);
    if (fileType.indexOf('image/') >= 0) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = async event => {
        await uploadCloudinary(get('target.result', event));
      }; // data url
      reader.readAsDataURL(blob);
    } else if (fileType.indexOf('text/html') >= 0) {
      const blob = itemSecond.getAsFile();
      const reader = new FileReader();
      reader.onload = async event => {
        await uploadCloudinary(get('target.result', event));
      }; // data url
      reader.readAsDataURL(blob);
    }
  }
});

const enhance = compose(
  setDisplayName('Format Form'),
  mapState,
  mapUploadHandler,
  mapHandler
);

export default enhance(PureImageUploader);
