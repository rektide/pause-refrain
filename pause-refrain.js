#!/usr/bin/env node
"use strict"

class PauseRefrain{
	static NewlineInput( cb){
		process.nextTick(()=> {
			var
			  encoding= this.encoding,
			  byline= require( "byline"),
			  emitter= byline( process.stdin, {encoding})
			if( this.outputMirror){
				emitter.on( "data", this.outputMirror)
			}
			emitter.on( "data", cb)
		})
		// danger: do not call before next tick has fired
		return ()=> {
			emitter.removeListener( "data", cb)
			if( this.outputMirror){
				emitter.on( "data", this.outputMirror)
			}
		}
	}
	static BasicAddCredit(){
		this.credit= this.depositAmount|| 2
	}

	constructor( options){
		Object.assign( this, exports.defaults, options)
		this.loop= this.loop.bind( this)
	}

	// The main loop of PauseRefrain consumes credits while outputting, until when creditless it shuts down the loop
	loop(){
		if( this.credit>= 1){
			// consume an entire credit
			--this.credit
			// perform our event
			if( this.outputPause){
				this.outputPause()
			}
		}else{
			// all other conditions reset
			this.credit= 0
			if( this.intervalHandle){
				// and stop looping
				clearInterval( this.intervalHandle)
			}
		}
	}

	// `input` is responsible for determining when to call the addCredit function provided to it.
	get input(){
		return this._input
	}
	set input( value){
		if( value== this._input){
			// no change, leave
			return
		}
		if( this._input){
			// clear out existing inputs
			this._input()
		}
		// input returns a function to make it stop
		this._input= value.call( this, this.addCredit)
	}

	// PauseRefrain continus outputting whenever there is remaining credit
	get credit(){
		return this._credit
	}
	// set the credit avilable, perhaps starting up the loop
	set credit( value){
		// check for start of loop & set new value
		var start= this._credit<= 0 && value&& value>= 1
		this._credit= value
		// we went from zero to some credit! start loop
		if( start){
			// calculate time to wait
			var interval= this.interval
			if( interval instanceof Function){
				// time to wait can be determined by a function
				interval= interval.call( this)
			}
			// start looping for as long as there is credit
			this.intervalHandle= setInterval( this.loop, interval)
		}
	}

	// bind addCredit when set
	get addCredit(){
		return this._addCredit
	}
	set addCredit( value){
		this._addCredit= value.bind( this)
	}
}

module.exports= exports= PauseRefrain
exports.defaults= {
	addCredit: PauseRefrain.BasicAddCredit,
	credit: 0,
	encoding: "utf8",
	interval: 2000,
	input: PauseRefrain.NewlineInput,
	intervalHandle: null,
	outputPause: ()=> console.log(),
	outputMirror: console.log
}

if( require.main=== module){
	require( "./main")()
}
