<template>
  <b-navbar-nav>
    <template v-for="link of navlinks">
      <b-nav-item :to="link.target" active-class="active" :exact="link.exact">{{ link.label }}</b-nav-item>
    </template>
  </b-navbar-nav>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

export interface Navlink {
    target: string,
    label: string,
    exact?: boolean,
}

@Component
export class AppNavbarNavlinks extends Vue {
    @Prop() private navlinks!: Navlink
}
export default AppNavbarNavlinks
</script>
