const path = require ('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	devtool: 'cheap-module-source-map',
	entry: {
		popup: path.resolve('./src/popup/popup.tsx')
	},
	module: {
		rules:[
			{
				use: 'ts-loader',
				test: /\.tsx?$/,
				exclude: /node_modules/
			}
		]
	},
	plugins: [
		new CopyPlugin(
			{
				patterns:[
					{
						//moving manifest file into the destination folder
						from: path.resolve('src/manifest.json'),
						to: path.resolve('dist')
					},
					{
						//moving asset file into the destination folder
						from: path.resolve('src/assests/'),
						to: path.resolve('dist')
					}
				],
			}
		),
		new HtmlPlugin(
			{
				title: 'ReactJS Boilerplate',
				filename: 'popup.html',
				chunks: ['popup']
			}
		)
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	output: {
		filename: '[name].js'
	}
}