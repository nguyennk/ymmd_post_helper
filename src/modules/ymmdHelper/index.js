import React from 'react';
import compose from 'recompose/compose';
import setDisplayName from 'recompose/setDisplayName';
import Grid from '@material-ui/core/Grid';

import { RootContainer } from './helper';
import { withStateHandlers } from 'recompose';
import ContentFormatter from './components/ContentFormatter';
import ImageHelper from './components/ImageHelper';

const PureYmmdHelper = ({ tabValue, setTabValue }) => (
  <RootContainer>
    <h3>Helpers</h3>
    <Grid container spacing={2}>
      <Grid id="content-float-div" item xs={6}>
        <ContentFormatter />
      </Grid>
      <Grid id="image-float-div" item xs={6}>
        <ImageHelper />
      </Grid>
    </Grid>
  </RootContainer>
);

const enhance = compose(setDisplayName('YMMD Helper'));

export default enhance(PureYmmdHelper);
