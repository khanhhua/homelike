import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import mockFetch from 'jest-fetch-mock';
import EventSource from 'eventsourcemock';

global.fetch = mockFetch;
global.EventSource = EventSource;
global.console = { info() {}, debug() {}, log() {} };
configure({ adapter: new Adapter() });
