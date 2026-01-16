import { render } from 'preact';

import './style.css';
import FileManager from './components/FileManager';
import { RemoteFileStore } from './store/RemoteStore';

const store = new RemoteFileStore('http://localhost:3000');

export function App() {
	return (
		<div>
			<FileManager store={store} />
		</div>
	);
}

render(<App />, document.getElementById('app'));
