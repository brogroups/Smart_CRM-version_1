<template>
    <div class="page d-flex column gap24">
        <div class="page-top d-flex j-between a-center">
            <h2 class="page-title">Архивный продукт</h2>
        </div>
        <div class="page-bottom">
            <table>
                <thead>
                    <tr>
                        <th>Имя клиента</th>
                        <th>Продукт</th>
                        <th>Телефон</th>
                        <th>Адрес</th>
                        <th>Цена</th>
                        <th>Время/архив</th>
                        <th>Статус</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in allArchive" :key="data.index">
                        <td>{{ data?.clientName }}</td>
                        <td>{{data?.productName}}</td>
                        <td>{{ data?.phone }}</td>
                        <td>{{data?.address}}</td>
                        <td>{{ formatSumma(data?.price) }}</td>
                        <td>{{ formatDate(data?.endDate) }}</td>
                        <td>{{ data?.status }}</td>
                        <td class="d-flex gap12 j-end">
                            <Icons name="edit" class="icon info" @click="handleEdit(data)"/>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!allArchive.length" class="d-flex j-center p12 text16">Архивы не найдены</div>
        </div>
    </div>
    <ProductModal :open="isOpen" @close="handleClose" @status="handleStatus($event)" :product="product" />
</template>
<script>
import eventNames from '@/universal/eventNames';
import { ipcRenderer } from 'electron';
import Icons from '../components/Icons.vue';
import ProductModal from '../models/ProductModal.vue';


export default {
    name: "ArchivePage",
    components:{
        Icons,
        ProductModal
    },
    data() {
        return {
            allArchive: [],
            isOpen:false,
            product:null
        }
    },
    methods: {
        async getAllArchive() {
            await ipcRenderer.invoke(eventNames.listArchiveEvent, {})
                .then((res) => {
                    if (res.status == 200) {
                        this.allArchive = res?.data
                    }
                })
        },
        handleClose(){
            this.isOpen=false
        },
        handleEdit(data){
            this.product=data
            this.isOpen=true
        },
        handleStatus(event){
            if(event){
                this.getAllArchive()
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("ru-RU");
        },
        formatSumma(summa) {
            return new Intl.NumberFormat("ru-RU").format(summa);
        },
    },
    mounted() {
        this.getAllArchive()
    }
}
</script>
<style></style>