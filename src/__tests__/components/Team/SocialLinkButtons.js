import React from 'react';
import SocialLinkButtons from '../../../components/Team/SocialLinkButtons';
import { shallow } from 'enzyme';

describe('<SocialLinkButtons />', () => {
  it('render SocialLinkButtons without crashing', () => {
    shallow(<SocialLinkButtons />);
  });
});
