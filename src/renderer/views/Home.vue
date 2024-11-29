<template lang="">
    <div class="mainbox">
        <LeftNavbar  @menu-click="currentView = $event"/>
        <HomePage v-if="currentView=='home'"/>
        <Product v-if="currentView=='product'" @viewProduct="viewProduct($event)"/>
        <OneDayDebts v-if="currentView=='rasxod'"/>
        <Firma v-if="currentView=='firma'" @viewFirma="viewFirma($event)"/>
        
        <Workers v-if="currentView=='worker'"/>
        <Kassa v-if="currentView=='kassa'"/>
        <RetProduct v-if="currentView=='vozvrat'"/>
        <Archive v-if="currentView=='archive'"/>
        <Settings v-if="currentView=='settings'"/>
        <OneProduct v-if="currentView=='oneProduct'" :product="productId" @exitProduct="this.currentView='product'"/>
        <OneFirma v-if="currentView=='oneFirma'" :firma="firmaId" @exitFirma="currentView='firma'"/>
    </div>
</template>
<script>
import OneProduct from '../additional/OneProduct.vue';
import LeftNavbar from '../components/LeftNavbar.vue'
import HomePage from '../pages/HomePage.vue';
import Firma from '../pages/Firma.vue';
import Product from '../pages/Product.vue';
import Settings from '../pages/Settings.vue';
import Kassa from '../pages/Kassa.vue';
import Workers from '../pages/Workers.vue';
import OneDayDebts from '../pages/OneDayDebts.vue';
import Archive from '../pages/Archive.vue';
import RetProduct from '../pages/RetProduct.vue';
import OneFirma from '../additional/oneFirma.vue';
export default {
    name:"HomeBanner",
    components:{
        LeftNavbar,
        HomePage,
        Product,
        Settings,
        Workers,
        Kassa,
        Firma,
        OneDayDebts,
        Archive,
        RetProduct,
        // oneInfo
        OneProduct,
        OneFirma
    },
    data(){
        return{
            currentView:'home',
            productId:null,
            firmaId:null
        }
    },
    methods:{
        viewProduct(event){
            this.currentView='oneProduct'
            this.productId=event
        },
        viewFirma(event){
            this.firmaId=event
            this.currentView='oneFirma'
        }
    }
}
</script>
<style >
    .mainbox{
        width: 100%;
        height: 100%;
        display: flex;
    }
</style>