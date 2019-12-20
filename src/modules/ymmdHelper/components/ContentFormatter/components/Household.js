import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import compose from 'recompose/compose';
import setDisplayName from 'recompose/setDisplayName';
import withStateHandlers from 'recompose/withStateHandlers';
import get from 'lodash/fp/get';
import forEach from 'lodash/fp/forEach';
import withHandlers from 'recompose/withHandlers';

import {
  ContentDiv,
  ContainerDiv,
  POST_FORMAT,
  processParagraph
} from '../../../helper';

const PureHouseholdFormatter = ({
  features,
  packageContent,
  notes,
  productImages,
  rawContent,
  updateField,
  formatContent
}) => (
  <ContainerDiv>
    <h4>Household Formatter</h4>
    <ContentDiv>
      <TextField
        value={features}
        onChange={value => updateField('features', get('target.value', value))}
        className="section-header-input"
        label="Features"
        variant="outlined"
        multiline
        rows={5}
      />
      <TextField
        value={packageContent}
        onChange={value =>
          updateField('packageContent', get('target.value', value))
        }
        className="section-header-input"
        label="Package Contents"
        variant="outlined"
        multiline
        rows={3}
      />
      <TextField
        value={notes}
        onChange={value => updateField('notes', get('target.value', value))}
        className="section-header-input"
        label="Notes"
        variant="outlined"
        multiline
        rows={3}
      />
      <TextField
        value={productImages}
        onChange={value =>
          updateField('productImages', get('target.value', value))
        }
        className="section-header-input"
        label="Product Details"
        variant="outlined"
        multiline
        rows={3}
      />
    </ContentDiv>
    <Button
      variant="contained"
      color="primary"
      className="editor-button"
      onClick={formatContent}>
      Format Post
    </Button>
    <ContentDiv id="result-container">
      <TextField
        className="section-result-input"
        onChange={value =>
          updateField('rawContent', get('target.value', value))
        }
        value={rawContent}
        label="Raw Post"
        multiline
        variant="outlined"
        rows={3}
      />
      <div className="previewContainer">
        <h3>Preview</h3>
        <div className="custom-post-format">
          <div
            dangerouslySetInnerHTML={{
              __html: `${rawContent.replace(/data-src/g, 'src')}`
            }}
          />
        </div>
      </div>
    </ContentDiv>
  </ContainerDiv>
);

const mapState = withStateHandlers(
  () => ({
    features: 'H: heading content\nfeature description',
    packageContent: '',
    notes: '',
    productImages: '',
    rawContent: ''
  }),
  {
    updateField: () => (field, value) => ({
      [field]: value
    })
  }
);

const mapWithHandler = withHandlers({
  formatContent: ({
    features,
    packageContent,
    notes,
    productImages,
    updateField
  }) => () => {
    const postArray = [];
    const fields = {
      FEATURES: features,
      CONTENT: packageContent,
      NOTES: notes,
      DETAILS: productImages
    };
    const convertForEach = forEach.convert({ cap: false });
    convertForEach((field, key) => {
      var formatted = '';
      if (field) {
        formatted = processParagraph(field);
        postArray.push(POST_FORMAT[key].replace('{{replace}}', formatted));
      }
    }, fields);

    if (postArray.length) {
      updateField('rawContent', postArray.join('\n'));
    }
  }
});

const enhance = compose(
  setDisplayName('Household Formatter'),
  mapState,
  mapWithHandler
);

export default enhance(PureHouseholdFormatter);
