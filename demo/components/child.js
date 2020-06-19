
  export const child = {
    name: 'child',
    props:{
      childType:{
        type:String,
        default:'default type'
      }
    },
    data() {
      return {
        items: [
          {id: 0, val: 'A'},
          {id: 1, val: 'B'},
          {id: 2, val: 'C'},
          {id: 3, val: 'D'}
        ]
      }
    },
    methods: {
      change() {
        this.items.reverse().push({id: 4, val: 'E'})
      }
    },
    template:`<div class="child">
      <div>
        <span>childType:{{childType}}</span>
        <ul>
          <li v-for="item in items" :key="item.id">{{ item.val }}</li>
        </ul>
      </div>
      <button @click="change">change</button>
    </div>`
    // render: h =>{ 
    //   return h('div',{},'aaa')
    // }
  }