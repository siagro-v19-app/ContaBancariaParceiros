sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"idxtec/lib/fragment/ParceiroNegocioHelpDialog"
], function(Controller, History, MessageBox, JSONModel, ParceiroNegocioHelpDialog) {
	"use strict";

	return Controller.extend("br.com.idxtecContaBancariaParceiros.controller.GravarContaBancaria", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarconta").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		handleSearchParceiro: function(oEvent){
			var oHelp = new ParceiroNegocioHelpDialog(this.getView(), "parceironegocio");
			oHelp.getDialog().open();
		},
		
		parceiroNegocioReceived: function() {
			this.getView().byId("parceironegocio").setSelectedKey(this.getOwnerComponent().getModel("model").getProperty("/Parceiro"));
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view"); 
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("parceironegocio").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Nova Conta Bancária"
				});
				
				var oNovaConta = {
					"Id": 0,
					"Parceiro": 0,
					"Titular": "",
					"Banco": "",
					"Agencia": "",
					"ContaCorrente": "",
					"Cnpj": "",
					"Cpf": ""
				};
				
				oJSONModel.setData(oNovaConta);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Conta Bancária"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView()) === true) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createConta();
			} else if (this._operacao === "editar") {
				this._updateConta();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("contabancaria", {}, true);
			}
		},
		
		_getDados: function() {
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.Parceiro = oDados.Parceiro ? parseInt(oDados.Parceiro, 0) : 0;
			
			oDados.ParceiroNegocioDetails = {
				__metadata: {
					uri: "/ParceiroNegocios(" + oDados.Parceiro + ")"
				}
			};
			debugger;
			return oDados;
		},
		
		_createConta: function() {
			var that = this; 
			var oModel = this.getOwnerComponent().getModel();
			
			oModel.create("/ContaBancariaParceiross", this._getDados(), {
				success: function() {
					MessageBox.success("Conta bancária inserida com sucesso!",{
						onClose: function(){
							that._goBack();
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateConta: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();

			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Conta bancária alterada com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("parceironegocio").getValue() === "" || oView.byId("banco").getValue() === ""
			|| oView.byId("titular").getValue() === ""|| oView.byId("agencia").getValue() === ""
			|| oView.byId("contacorrente").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});

});