import { supabase } from '@/lib/supabase';

export type CallSignal = {
  callerName: string;
  callerPhone: string;
  channelName: string;
  status: 'dialing' | 'connected' | 'ended';
};

export const callService = {
  // Initiate broadcast signaling channel for voice call
  startCall(recipientPhone: string, callerName: string): {
    channelName: string;
    endCall: () => void;
  } {
    const channelName = `call-room-${recipientPhone.replace(/[^0-9]/g, '')}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel.subscribe((status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'incoming-call',
          payload: {
            callerName,
            status: 'dialing',
          },
        });
      }
    });

    return {
      channelName,
      endCall: () => {
        channel.send({
          type: 'broadcast',
          event: 'call-ended',
          payload: { status: 'ended' },
        });
        supabase.removeChannel(channel);
      },
    };
  },

  // Listen for incoming call signals on registered user phone channel
  listenForCalls(userPhone: string, onIncomingCall: (signal: CallSignal) => void) {
    const channelName = `user-calls-${userPhone.replace(/[^0-9]/g, '')}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'incoming-call' }, (payload) => {
        if (payload.payload) {
          onIncomingCall({
            callerName: payload.payload.callerName || 'Ghanaian Farmer / Buyer',
            callerPhone: userPhone,
            channelName,
            status: payload.payload.status || 'dialing',
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
