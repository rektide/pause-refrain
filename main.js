#!/usr/bin/env node
"use strict"

var PauseRefrain= require( ".")

function main(){
	var pauseRefrain= new PauseRefrain()
}

module.exports= main
if( require.main=== module){
	main()
}
