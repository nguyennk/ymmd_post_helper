import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import compose from 'recompose/compose';
import setDisplayName from 'recompose/setDisplayName';
import withStateHandlers from 'recompose/withStateHandlers';

import { ContainerDiv, TabPanel } from '../../helper';
import Watermarking from './components/Watermarking';
import ImageUploader from './components/ImageUploader';
import ImgurUploader from './components/ImgurUploader';

const PureContentFormatter = ({ tabValue, setTabValue }) => (
  <ContainerDiv>
    <Tabs
      value={tabValue}
      onChange={setTabValue}
      indicatorColor="secondary"
      textColor="secondary">
      <Tab label="Watermarking Image" />
      <Tab label="Optimize Image" />
      <Tab label="Imgur Uploader" />
    </Tabs>
    <TabPanel value={tabValue} index={0}>
      <Watermarking />
    </TabPanel>
    <TabPanel value={tabValue} index={1}>
      <ImageUploader />
    </TabPanel>
    <TabPanel value={tabValue} index={2}>
      <ImgurUploader />
    </TabPanel>
  </ContainerDiv>
);

const enhance = compose(
  setDisplayName('Content Formatter'),
  withStateHandlers(
    () => ({
      tabValue: 0
    }),
    {
      setTabValue: () => (_, newValue) => ({
        tabValue: newValue
      })
    }
  )
);

export default enhance(PureContentFormatter);
