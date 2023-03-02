import React from 'react';
import {createRoot} from 'react-dom/client'

const test =(
    <div>
        <h1>Hello World</h1>
        <p>The world we live in is constantly evolving, and we need to adapt to these changes to thrive. We need to be resilient and open to new ideas and perspectives. We need to be proactive and take action to create a better future for ourselves and for those around us.</p>
    </div>
)

const container = document.createElement('div')
document.body.appendChild(container)

const root = createRoot(container)
root.render(test)