const Vue = require('../dist/vue')
console.log("Vue Imported")

// import child from './components/child.vue'
const {child} = require('./components/child')
debugger
new Vue({
  el:"#app",
  components: {child},
  data:()=>{
    return { 
      messageA: 'Hello',
      messageB: 'Vue!',
      watchPropA:1
    }
  },
  mounted(){
    debugger
    this.messageA="new"
  },
  computed: {
    message:{
      get:function(){ return this.messageA + ' ' + this.messageB},
      set:function(val){ 
        debugger
        this.messageA=val.split(' ')[0]
        this.messageB=val.split(' ')[0]
      }
    },
    messageAA:{
      get:function(){ return this.messageA + ' ' + this.messageA},
      set:function(val){ 
        debugger
        this.messageA=val.split(' ')[0]
      }
    },
    messageBB:{
      get:function(){ return this.messageB + ' ' + this.messageB},
      set:function(val){ 
        debugger
        this.messageB=val.split(' ')[0]
      }
    }
  },
  watch: {
    watchPropA:function(newVal,oldVal){
      console.log([newVal,oldVal]);
    }
  }
})

// (function anonymous() {
// 	with(this){
// 		return _c(
//       'div',
//       {
//         attrs:{
//           "id":"app"
//         }
//       },
//       [_v(_s(message))]
//     )
//   }
// })