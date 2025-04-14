// Purpose: Wraps async functions to handle errors in Express middleware
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
