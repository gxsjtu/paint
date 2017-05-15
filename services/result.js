var Result = function(error, data) {
    this.status = error.status;
    this.message = error.message;
    this.data = data;
};

module.exports = Result;
