<template>
  <b-navbar-nav>
    <template v-for="link of navlinks">
      <b-nav-item :to="link.target" active-class="active" :exact="link.exact">{{ link.label }}</b-nav-item>
    </template>
  </b-navbar-nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { RawLocation} from 'vue-router'

export interface Navlink {
  target: RawLocation,
  label: string,
  exact?: boolean,
}

@Component
export class AppNavbarNavlinks extends Vue {
  @Prop() private navlinks!: Navlink
}
export default AppNavbarNavlinks
</script>
