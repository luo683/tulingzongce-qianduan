import Layout from './Layout.vue'
import HomeHero from './components/HomeHero.vue'
import HomeFeatures from './components/HomeFeatures.vue'
import HomeStats from './components/HomeStats.vue'
import HomePosts from './components/HomePosts.vue'
import BlogIndex from './components/BlogIndex.vue'
import BlogComment from './components/BlogComment.vue'
import QaFAQ from './components/QaFAQ.vue'
import FadeInSection from './components/FadeInSection.vue'
import ResourceList from './components/ResourceList.vue'
import AskQuestion from './components/AskQuestion.vue'
import BackToTop from './components/BackToTop.vue'
import CodeCopy from './components/CodeCopy.vue'
import RelatedPosts from './components/RelatedPosts.vue'
import EventTimeline from './components/EventTimeline.vue'
import TableOfContents from './components/TableOfContents.vue'
import MemberList from './components/MemberList.vue'
import ProjectShowcase from './components/ProjectShowcase.vue'
import FeaturedProject from './components/FeaturedProject.vue'
import AdvisorSection from './components/AdvisorSection.vue'
import AboutTimeline from './components/AboutTimeline.vue'
import TagCloud from './components/TagCloud.vue'
import FeaturedPostBanner from './components/FeaturedPostBanner.vue'
import ComprehensiveLeaders from './components/ComprehensiveLeaders.vue'
import './custom.css'

// GSAP 全局注册
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('HomeHero', HomeHero)
    app.component('HomeFeatures', HomeFeatures)
    app.component('HomeStats', HomeStats)
    app.component('HomePosts', HomePosts)
    app.component('BlogIndex', BlogIndex)
    app.component('BlogComment', BlogComment)
    app.component('QaFAQ', QaFAQ)
    app.component('FadeInSection', FadeInSection)
    app.component('ResourceList', ResourceList)
    app.component('AskQuestion', AskQuestion)
    app.component('RelatedPosts', RelatedPosts)
    app.component('EventTimeline', EventTimeline)
    app.component('MemberList', MemberList)
    app.component('ProjectShowcase', ProjectShowcase)
    app.component('FeaturedProject', FeaturedProject)
    app.component('AdvisorSection', AdvisorSection)
    app.component('AboutTimeline', AboutTimeline)
    app.component('TagCloud', TagCloud)
    app.component('FeaturedPostBanner', FeaturedPostBanner)
    app.component('ComprehensiveLeaders', ComprehensiveLeaders)
  },
}
