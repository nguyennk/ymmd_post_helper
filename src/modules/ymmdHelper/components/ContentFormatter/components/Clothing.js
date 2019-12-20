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
  processParagraph,
  POST_FORMAT,
  SIZE_TABLE,
  sockSizeConverter
} from '../../../helper';
import map from 'lodash/fp/map';

const PureClothingFormatter = ({
  description,
  sizechart,
  features,
  materials,
  care,
  rawContent,
  updateField,
  formatContent
}) => (
  <ContainerDiv>
    <h4>Clothing Formatter</h4>
    <ContentDiv>
      <TextField
        value={description}
        onChange={value =>
          updateField('description', get('target.value', value))
        }
        className="section-header-input"
        label="Description"
        variant="outlined"
        multiline
        rows={5}
      />
      <TextField
        value={sizechart}
        onChange={value => updateField('sizechart', get('target.value', value))}
        className="section-header-input"
        label="Size Chart"
        variant="outlined"
        multiline
        rows={3}
      />
      <TextField
        value={materials}
        onChange={value => updateField('materials', get('target.value', value))}
        className="section-header-input"
        label="Materials"
        variant="outlined"
        multiline
        rows={3}
      />
      <TextField
        value={care}
        onChange={value => updateField('care', get('target.value', value))}
        className="section-header-input"
        label="Care Instruction"
        variant="outlined"
        multiline
        rows={3}
      />
      <TextField
        value={features}
        onChange={value => updateField('features', get('target.value', value))}
        className="section-header-input"
        label="Features"
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
        rows={5}
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
    description: '',
    sizechart: 'SOCK 35-40',
    features: '',
    materials: 'Materials: Cotton | Polyester | Spandex',
    care: ``,
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
    description,
    sizechart,
    features,
    materials,
    care,
    updateField
  }) => () => {
    const postArray = [];
    const fields = {
      DESCRIPTION: description,
      SIZE: sizechart,
      MATERIALS: materials,
      CARE: care,
      FEATURES: features
    };
    const convertForEach = forEach.convert({ cap: false });
    const convertMap = map.convert({ cap: false });
    convertForEach((field, key) => {
      var formatted = '';
      if (field) {
        switch (key) {
          case 'SIZE':
            const sizeType = field.split(' ')[0];
            const sizeRange = field
              .substring(field.indexOf(' ') + 1)
              .split(' ');
            if (sizeType === 'SOCK') {
              const SizeValues = sockSizeConverter(sizeRange);
              const SizeRows = convertMap((sizeArray, sizeTitle) => {
                const row = `<tr><td>${sizeTitle}</td>{{replace}}</tr>`;
                const sizes = map(size => `<td>${size}</td>`, sizeArray);
                return row.replace('{{replace}}', sizes.join('\n'));
              }, SizeValues);
              const sizeTableContent = SIZE_TABLE.SOCK.replace(
                '{{replace}}',
                SizeRows.join('\n')
              );
              postArray.push(
                POST_FORMAT.SIZE.replace('{{replace}}', sizeTableContent)
              );
            }
            break;
          case 'MATERIALS':
            formatted = processParagraph(field);
            postArray.push(
              POST_FORMAT.MATERIALS.replace('{{replace}}', formatted)
            );
            break;
          case 'CARE':
            formatted = processParagraph(field);
            postArray.push(POST_FORMAT.CARE.replace('{{replace}}', formatted));
            break;
          default:
            formatted = processParagraph(field);
            postArray.push(formatted);
            break;
        }
      }
    }, fields);

    if (postArray.length) {
      updateField('rawContent', postArray.join('\n'));
    }
  }
});

const enhance = compose(
  setDisplayName('Clothing Formatter'),
  mapState,
  mapWithHandler
);

export default enhance(PureClothingFormatter);
