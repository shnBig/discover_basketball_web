import { defineAsyncComponent } from 'vue'

export default {
  install(app) {
    const components = import.meta.glob('./*.vue')
    
    for (const [path, component] of Object.entries(components)) {
      const componentName = path
        .replace('./', '')
        .replace('.vue', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      
      app.component(componentName, defineAsyncComponent(component))
    }
  }
}