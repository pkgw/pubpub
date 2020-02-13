export default (sequelize, dataTypes) => {
	return sequelize.define('PubStyle', {
		id: sequelize.idType,
		headerStyle: dataTypes.STRING,
		headerBackgroundColor: dataTypes.STRING,
		headerBackgroundImage: dataTypes.TEXT,
	});
};
