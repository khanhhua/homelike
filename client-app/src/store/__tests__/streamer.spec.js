/* eslint-env jest */
import { sources } from 'eventsourcemock';
import getStreamer from '../streamer';

describe('streamer', () => {
  describe('streamer as a singleton', () => {
    it('should generate only one instance of streamer', () => {
      expect(getStreamer()).toBe(getStreamer());
    });

    it('should expose a public function subsribe', () => {
      expect(getStreamer().subscribe).toBeInstanceOf(Function);
    });
  });

  describe('receiveCallback', () => {
    it('should trigger receiveCallback for a chat event', () => {
      const streamer = getStreamer();
      const spy = jest.fn();
      const channelId = 'channel123';
      const message = {
        id: '1',
        message: 'Chat message 1',
        sender: 'u1',
      };

      streamer.subscribe(channelId, {}, { receiveCallback: spy });

      const es = sources['http://localhost:3000/sse/channels/channel123'];
      expect(es).toBeDefined();
      es.emitOpen();
      es.emit('pong', { data: 'd1140043-d8a7-48bb-8303-7a9ff61ace61' });
      es.emit('chat', { data: JSON.stringify(message) });

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0]).toEqual([null, [message]]);
    });

    it('should not trigger receiveCallback for non-chat events', () => {
      const streamer = getStreamer();
      const spy = jest.fn();
      const channelId = 'channel123';
      const message = {
        id: '1',
        message: 'Chat message 1',
        sender: 'u1',
      };

      streamer.subscribe(channelId, {}, { receiveCallback: spy });

      const es = sources['http://localhost:3000/sse/channels/channel123'];
      expect(es).toBeDefined();
      es.emitOpen();
      es.emit('pong', { data: 'd1140043-d8a7-48bb-8303-7a9ff61ace61' });
      es.emit('chat.edit', { data: JSON.stringify(message) });
      es.emit('chat.remove', { data: JSON.stringify(message) });
      es.emit('unknown', { data: JSON.stringify(message) });

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('editCallback', () => {
    it('should trigger editCallback for a chat.edit event', () => {
      const streamer = getStreamer();
      const spy = jest.fn();
      const channelId = 'channel123';
      const message = {
        id: '1',
        message: 'Chat message 1',
        sender: 'u1',
      };

      streamer.subscribe(channelId, {}, { editCallback: spy });

      const es = sources['http://localhost:3000/sse/channels/channel123'];
      expect(es).toBeDefined();
      es.emitOpen();
      es.emit('pong', { data: 'd1140043-d8a7-48bb-8303-7a9ff61ace61' });
      es.emit('chat.edit', { data: JSON.stringify(message) });

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0]).toEqual([null, [message]]);
    });

    it('should not trigger editCallback for non-chat.edit events', () => {
      const streamer = getStreamer();
      const spy = jest.fn();
      const channelId = 'channel123';
      const message = {
        id: '1',
        message: 'Chat message 1',
        sender: 'u1',
      };

      streamer.subscribe(channelId, {}, { editCallback: spy });

      const es = sources['http://localhost:3000/sse/channels/channel123'];
      expect(es).toBeDefined();
      es.emitOpen();
      es.emit('pong', { data: 'd1140043-d8a7-48bb-8303-7a9ff61ace61' });
      es.emit('chat', { data: JSON.stringify(message) });
      es.emit('chat.remove', { data: JSON.stringify(message) });
      es.emit('unknown', { data: JSON.stringify(message) });

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('removeCallback', () => {
    it('should trigger removeCallback for a chat.remove event', () => {
      const streamer = getStreamer();
      const spy = jest.fn();
      const channelId = 'channel123';
      const message = {
        id: '1',
        message: 'Chat message 1',
        sender: 'u1',
      };

      streamer.subscribe(channelId, {}, { removeCallback: spy });

      const es = sources['http://localhost:3000/sse/channels/channel123'];
      expect(es).toBeDefined();
      es.emitOpen();
      es.emit('pong', { data: 'd1140043-d8a7-48bb-8303-7a9ff61ace61' });
      es.emit('chat.remove', { data: JSON.stringify(message) });

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0]).toEqual([null, [message]]);
    });

    it('should not trigger removeCallback for non-chat.remove events', () => {
      const streamer = getStreamer();
      const spy = jest.fn();
      const channelId = 'channel123';
      const message = {
        id: '1',
        message: 'Chat message 1',
        sender: 'u1',
      };

      streamer.subscribe(channelId, {}, { removeCallback: spy });

      const es = sources['http://localhost:3000/sse/channels/channel123'];
      expect(es).toBeDefined();
      es.emitOpen();
      es.emit('pong', { data: 'd1140043-d8a7-48bb-8303-7a9ff61ace61' });
      es.emit('chat', { data: JSON.stringify(message) });
      es.emit('chat.edit', { data: JSON.stringify(message) });
      es.emit('unknown', { data: JSON.stringify(message) });

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
