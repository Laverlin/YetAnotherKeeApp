import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { SvgPath } from '../control/common/SvgPath';


describe('MainFrame', () => {
  it('should render', () => {
    expect(render(
      <SvgPath path = {SystemIcon.allItems}/>
    )).toBeTruthy();
  });
});import { SystemIcon } from '../entity/model/const/DefaultKeeIcon';

