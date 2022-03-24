const fs = require('fs-extra');
const path = require('path');
const { genOpenapiv3FromRoutingControllers } = require('../dist/index');

const fn = async () => {
  const { tsTransfromData, openapiv3 } = await genOpenapiv3FromRoutingControllers();
  // console.log('????????????', JSON.stringify(tsTransfromData, null, 2));
  console.log('openapiv3: ', JSON.stringify(openapiv3, null, 2));
};

fn();
