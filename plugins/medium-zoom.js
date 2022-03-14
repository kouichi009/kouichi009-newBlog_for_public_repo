import Vue from 'vue'
import zoom from 'medium-zoom'

Vue.mixin({
 methods: {
  mediumZoom() {
    //  zoom('.container img')
     zoom('.content-image')
   },
 }
})
