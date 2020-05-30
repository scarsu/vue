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
      message1: 'Hello',
      message2: 'Vue!'
    }
  },
  mounted(){
    debugger
    this.message1="new"
  },
  computed: {
    message:{
      get:function(){ return this.message1 + ' ' + this.message2},
      set:function(val){ 
        debugger
        this.message1=val.split(' ')[0]
        this.message2=val.split(' ')[1]
      }
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