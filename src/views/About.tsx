import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'About',

  setup() {
    return () => (
      <div class="about">
        <h1>This is an about page</h1>
      </div>
    )
  },
})
