<template>
  <b-navbar-nav>
    <template v-for="(link, lidx) of navlinks">
      <b-nav-item :to="link.target" active-class="active" :exact="link.exact" :key="lidx">{{ $t(link.message) }}</b-nav-item>
    </template>
  </b-navbar-nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { RawLocation} from 'vue-router'

export interface Navlink {
  target: RawLocation,
  message: string,
  exact?: boolean,
}

@Component
export class AppNavbarNavlinks extends Vue {
  @Prop({ default: [] }) private navlinks!: Navlink[]
}
export default AppNavbarNavlinks
</script>
