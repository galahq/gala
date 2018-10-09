/**
 * @noflow
 */

 import { Controller } from 'stimulus'

 export default class extends Controller {
   static targets = ['input', 'preview']

   update () {
     this.previewTarget.innerText = this.inputTarget.value   
   }
 }
