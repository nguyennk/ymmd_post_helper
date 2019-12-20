import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import compose from 'recompose/compose';
import setDisplayName from 'recompose/setDisplayName';
import withStateHandlers from 'recompose/withStateHandlers';
import get from 'lodash/fp/get';
import getOr from 'lodash/fp/getOr';
import withHandlers from 'recompose/withHandlers';
import withPropsOnChange from 'recompose/withPropsOnChange';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import watermark from 'watermarkjs';
import ReactCursorPosition, { INTERACTIONS } from 'react-cursor-position';

import {
  uploadPhoto,
  ContentDiv,
  ContainerDiv,
  CIM_TOKEN,
  reuploadImgur,
  WATERMARK_LOGO
} from '../../../../helper';

const PureWatermarking = ({
  isUploading,
  handlePaste,
  handleBrowse,
  url,
  logoSize,
  updateSize,
  updateUrl,
  uploadUrl,
  triggerPreview,
  finalizeUpload,
  isFinalized,
  imageCode,
  handleLogoPositionChange,
  recordLogoPosition,
  canvasWidth,
  canvasHeight
}) => (
  <ContainerDiv>
    <h4>Watermark Photo</h4>
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
        className="resultCustomInput"
        value={logoSize}
        onChange={updateSize}
        label="Logo Size"
        variant="outlined"
      />
      <div style={{ margin: '25px 0' }}>
        <Button
          variant="contained"
          color="default"
          className="editor-button-default"
          onClick={triggerPreview}
          disabled={isUploading}>
          Preview
        </Button>
        <Button
          variant="contained"
          color="primary"
          className="editor-button"
          onClick={finalizeUpload}
          disabled={isUploading}>
          Finalize
        </Button>
      </div>
      {imageCode && (
        <div
          className="previewContainer"
          style={{
            width: canvasWidth,
            margin: '0 auto'
          }}>
          <h3>Preview</h3>
          <ReactCursorPosition
            activationInteractionMouse={INTERACTIONS.CLICK} //default
            onPositionChanged={handleLogoPositionChange}>
            <div
              id="watermark-preview"
              onClick={recordLogoPosition}
              style={{
                width: canvasWidth,
                height: canvasHeight
              }}
            />
          </ReactCursorPosition>
          {isFinalized && (
            <TextField
              className="section-result-input"
              value={imageCode}
              label="Final URL"
              multiline
              variant="outlined"
              rows={3}
            />
          )}
        </div>
      )}
    </ContentDiv>
  </ContainerDiv>
);

const getLogoPath = size =>
  `https://${CIM_TOKEN}.cloudimg.io/width/${size}/x/${WATERMARK_LOGO}`;

const DEFAULT_LOGO_SIZE = 100;

const mapState = withStateHandlers(
  () => ({
    url: '',
    imageCode: '',
    isUploading: false,
    canvasWidth: 0,
    canvasHeight: 0,
    logoX: 60,
    logoY: 60,
    tempX: 0,
    tempY: 0,
    logoSize: DEFAULT_LOGO_SIZE,
    resizedLogo: getLogoPath(DEFAULT_LOGO_SIZE),
    watermarkValue: undefined,
    isFinalized: false
  }),
  {
    updateCanvasSize: () => (width, height) => ({
      canvasWidth: width,
      canvasHeight: height
    }),
    updateUploadState: () => value => ({
      isUploading: value
    }),
    updateUrl: () => e => ({
      url: e.target.value
    }),
    updateSize: () => e => {
      return {
        logoSize: e.target.value,
        resizedLogo: getLogoPath(e.target.value)
      };
    },
    updateImageCode: () => code => ({
      imageCode: code
    }),
    updateWatermarked: () => value => ({
      watermarkValue: value
    }),
    updateX: () => e => ({
      logoX: e.target.value
    }),
    updateY: () => e => ({
      logoY: e.target.value
    }),
    setFinalized: () => isFinalized => ({
      isFinalized
    }),
    handleLogoPositionChange: () => positionObj => {
      const positionX = get('position.x', positionObj);
      const positionY = get('position.y', positionObj);
      return {
        tempX: positionX,
        tempY: positionY
      };
    },
    recordLogoPosition: ({ tempX, tempY }) => () => ({
      logoX: tempX,
      logoY: tempY
    })
  }
);

const getImageWrapper = (link, fileName) => link;

const mapPreview = withHandlers({
  triggerPreview: ({
    updateWatermarked,
    logoX,
    logoY,
    imageCode,
    updateCanvasSize,
    resizedLogo,
    logoSize
  }) => async () => {
    const options = {
      init(img) {
        img.crossOrigin = 'anonymous';
      }
    };
    if (document.getElementById('watermark-preview'))
      document.getElementById('watermark-preview').innerHTML = '';
    await watermark([imageCode, resizedLogo], options)
      .image(
        watermark.image.atPos(
          canvas => {
            updateCanvasSize(canvas.width, canvas.height);
            return logoX - logoSize / 2.0;
          },
          _ => {
            return logoY - logoSize / 2.0;
          },
          1
        )
      )
      .then(img => {
        updateWatermarked(img);
        document.getElementById('watermark-preview').appendChild(img);
      });
  }
});

const mapUploadHandler = withHandlers({
  uploadCloudinary: ({ updateImageCode, updateUploadState }) => async file => {
    updateUploadState(true);
    // updateImageCode('');
    const result = await uploadPhoto(file);
    const uploadedUrl = get('secure_url', result);
    const fileName = getOr('', 'original_filename', result);
    const formattedCode = getImageWrapper(uploadedUrl, fileName);
    updateImageCode(formattedCode);
    updateUploadState(false);
  },
  uploadImgur: ({ updateImageCode, updateUploadState }) => async file => {
    updateUploadState(true);
    // updateImageCode('');
    const result = await reuploadImgur(file);
    const imgurUrl = get('data.link', result);
    const fileName = getOr('', 'data.id', result);
    const formattedCode = getImageWrapper(imgurUrl, fileName);
    updateImageCode(formattedCode);
    updateUploadState(false);
  }
});

const mapHandler = withHandlers({
  uploadUrl: ({
    url,
    uploadCloudinary,
    triggerPreview,
    setFinalized
  }) => async () => {
    setFinalized(false);
    await uploadCloudinary(url);
    await triggerPreview();
  },
  handleBrowse: ({
    uploadCloudinary,
    triggerPreview,
    setFinalized
  }) => async data => {
    setFinalized(false);
    const file = get('target.files[0]', data);
    await uploadCloudinary(file);
    await triggerPreview();
  },
  handlePaste: ({ uploadCloudinary, triggerPreview, setFinalized }) => async ({
    clipboardData
  }) => {
    setFinalized(false);
    const item = get('items[0]', clipboardData);
    const itemSecond = get('items[1]', clipboardData);
    const fileType = get('type', item);
    if (fileType.indexOf('image/') >= 0) {
      const blob = item.getAsFile();
      const reader = new FileReader();
      reader.onload = async event => {
        await uploadCloudinary(get('target.result', event));
        await triggerPreview();
      }; // data url
      reader.readAsDataURL(blob);
    } else if (fileType.indexOf('text/html') >= 0) {
      const blob = itemSecond.getAsFile();
      const reader = new FileReader();
      reader.onload = async event => {
        await uploadCloudinary(get('target.result', event));
        await triggerPreview();
      }; // data url
      reader.readAsDataURL(blob);
    }
  },
  finalizeUpload: ({
    uploadImgur,
    watermarkValue,
    setFinalized
  }) => async () => {
    console.log(watermarkValue);
    const source = get('src', watermarkValue);
    await uploadImgur(source.replace('data:image/png;base64,', ''));
    setFinalized(true);
  }
});

const enhance = compose(
  setDisplayName('Format Form'),
  mapState,
  mapPreview,
  mapUploadHandler,
  mapHandler,
  withPropsOnChange(['logoX', 'logoY'], ({ triggerPreview }) => {
    triggerPreview();
  })
);

export default enhance(PureWatermarking);
