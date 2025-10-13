import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import * as announcements from './server/announcements.tsx';
import * as courses from './server/courses.tsx';
import * as events from './server/events.tsx';
import * as tickets from './server/tickets.tsx';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
