## VuePunLoader

> 这是一个 `webpack loader`。根据相应规则自动生成 `.vue` 文件, 附带文件中的相应代码。例如 test.pun 的文件内容是:
```
<template>
  <span @click="echo">this is test pun</span>
</template>

<script>
export default {
  methods: {
    echo () {
      console.log('click test')
    }
  }
}
</script>
```

会自动解析成如下的 .vue 文件
```
<script>
import Vue from 'vue'
const PunComponent = Vue.extend({
  template: `<span @click="echo">this is test pun</span>`,
  methods: {
    echo() {
      console.log('click test')
    }
  },
  components: {}
})
export default {
  data: function() {
    return {
      PunCode: {
        template: '<span @click="echo">this is test pun</span>',
        script:
          "export default {\n  methods: {\n    echo () {\n      console.log('click test')\n    }\n  }\n}",
        style: ''
      }
    }
  },
  components: { PunComponent }
}
</script>
```

### 名词解释

* 内置组件

解析文件中,
```
const PunComponent = Vue.extend({...})
export default {
  ...
  components: { PunComponent }
}
```
`PunComponent` 作为一个子组件内置在解析文件中, 我们约定它为内置组件

* 代码属性

解析文件中,
```
export default {
  data: function() {
    return {
      PunCode: {
        template: '...',
        script: '...',
        style: '...'
      }
    }
  }
}
```
`PunCode` 是自动生成 data 属性, 用于记录 .pun 文件各个标签中的代码, 我们约定它为代码属性

### 用法

* 安装
```
  npm install vue-pun-loader --save-dev
```
或
```
  yarn add vue-pun-loader -D
```

* webpack 配置
```
module: {
  rules: [
    ...
    {
      test: /\.pun$/,
      use: [
        {
          loader: 'vue-loader'
        },
        {
          loader: 'vue-pun-loader',
          options: {
            ...
          }
        }
      ]
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader'
    }
    ...
  ]
}
```

* 在 script 标签中继承 pun 组件
```
<script>
import Pun from './test.pun'
export default {
  extends: Pun, // 继承 pun 组件
  components: {
    ...Pun.components // 扩展 pun 组件的 components
  }
}
</script>
```

* 在 template 标签中使用内置组件
```
<template>
  <section>
    <pun-component />
  </section>
</template>
```

* data 选项中会自动添加一个代码属性
```
PunCode: {
  template: '<span @click="echo">this is test pun</span>',
  script:
    "export default {\n  methods: {\n    echo () {\n      console.log('click test')\n    }\n  }\n}",
  style: ''
}
```

### 规则

* webpack 配置之 options

| 配置项 | 数据类型 | 描述 | 默认值 |
| :------| :------| :------| :------|
| punPrefix | String | pun 组件和 data 选项中 '${...}Code' 属性的前缀。<br>如果设成 'Vuepun' 则内置组件名为 'VuepunComponent', <br>代码属性为 'VuepunCode'。 | Pun |
| debug | Boolean | 如果为真, 则会在 .pun 文件同级目录上生成一个同名的<br> .pun.compiler 文件。 | false |

* .pun 文件中的标签

> template: 同 .vue 文件中的 template 标签。如果存在多个 template 标签, 只有最后一个生效。

> script: 同 .vue 文件中的 script 标签。如果存在多个 script 标签, 只有最后一个生效。

> style: 同 .vue 文件中的 style 标签。如果存在多个 script 标签, 多个标签同时生效;<br>
style 标签可以有 `alias` 属性, 用作该标签的别名。

> component: 一个内置组件, 里面可包含 template、script、style, 各标签规则如上;<br>
如果 .pun 文件中既有 component 标签, 又有 template、script、style, 只有 component 标签生效;<br>
如果存在多个 component 标签, 多个标签同时生效;<br>
component 标签可以有 `alias` 属性, 用作该标签的别名。

* alias 别名

alias 可用于 style、component 标签中。

---
style 标签的用法及效果:
```
<style>
  .white { color: #fff; }
</style>

<style alias="blackStyle">
  .black { color: #000; }
</style>
```
解析代码属性的结果为
```
punCode: {
  style: {
    '0': '.white { color: #fff; }',
    '1': '.black { color: #000; }',
    'blackStyle': '.black { color: #000; }'
  }
}
```
---
component 标签的用法及效果:
```
<component alias="test">
  <template>
    <section>This is test 1</section>
  </template>
</component>

<component>
  <template>
    <section @click="echo">This is test 2</section>
  </template>
  <script>
    export default {
      methods: {
        echo () {
          console.log('test')
        }
      }
    }
  </script>
</component>
```
解析内置组件的结果为
```
import Vue from 'vue'
const PunComponent0 = Vue.extend({
  template: `<section>This is test 1</section>`
})
const PunComponentTest = Vue.extend({
  template: `<section>This is test 1</section>`
})
const PunComponent1 = Vue.extend({
  template: `<section>This is test 2</section>`,
  methods: {
    echo () {
      console.log('test')
    }
  }
})
```
解析代码属性的结果为
```
punCode: {
  '0': {
    template: `<section>This is test 1</section>`,
    javascript: '',
    style: ''
  },
  '1': {
    template: `<section>This is test 2</section>`,
    javascript: `
      export default {
        methods: {
          echo () {
            console.log('test')
          }
        }
      }
    `,
    style: ''
  },
  'test': {
    template: `<section>This is test 1</section>`,
    javascript: '',
    style: ''
  }
}
```
