import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import mockFetch from 'jest-fetch-mock';

global.fetch = mockFetch;
configure({ adapter: new Adapter() });
