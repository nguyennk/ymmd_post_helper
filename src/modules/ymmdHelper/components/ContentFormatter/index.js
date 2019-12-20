import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import compose from 'recompose/compose';
import setDisplayName from 'recompose/setDisplayName';
import withStateHandlers from 'recompose/withStateHandlers';

import { ContainerDiv, TabPanel } from '../../helper';
import Household from './components/Household';
import Clothing from './components/Clothing';

const PureContentFormatter = ({ tabValue, setTabValue }) => (
  <ContainerDiv>
    <Tabs
      value={tabValue}
      onChange={setTabValue}
      indicatorColor="secondary"
      textColor="secondary">
      <Tab label="Household" />
      <Tab label="Clothing" />
    </Tabs>
    <TabPanel value={tabValue} index={0}>
      <Household />
    </TabPanel>
    <TabPanel value={tabValue} index={1}>
      <Clothing />
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
