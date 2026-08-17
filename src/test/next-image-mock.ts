import React from 'react';

export default function NextImageMock(props: Record<string, unknown>) {
  // render a plain img for tests
  return React.createElement('img', { ...props, 'data-testid': 'next-image' });
}