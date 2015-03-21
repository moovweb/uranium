"use strict";

describe("jQuery " + $.fn.jquery, function() {

  var jqVersion = $.fn.jquery.split(".");
  if (jqVersion[0] == 1 && jqVersion[1] < 4)
  describe("jQuery patchwork", function() {
    it("should have $.error()", function() {
      expect($).itself.to.respondTo("error");
    });
    it("should have on()", function() {
      expect($).to.respondTo("on");
    });
    it("should have off()", function() {
      expect($).to.respondTo("off");
    });
    it("should have addBack()", function() {
      expect($).to.respondTo("addBack");
    });
    it("should have the newer closest()");
  });

  it("should expose a global object", function() {
    expect(window.Uranium).to.exist;
  });

  it("should add Uranium as a jQuery function", function() {
    expect($).to.respondTo("Uranium");
  });

  var toggler = $(
    "<section data-ur-set='toggler'>" +
    "<a data-ur-toggler-component='button'></a>" +
    "<div data-ur-toggler-component='content'></div>" +
    "</section>");

  $("body").append(toggler);
  it("should execute automatically by default", function() {
    expect(toggler.attr("data-ur-id")).to.not.be.empty;
  });

  it("should not initialize widgets twice", function() {
    $(document).Uranium();
    toggler.find("a").click();
    expect(toggler.find("a").attr("data-ur-state")).to.equal("enabled");
  });

  it("should be able to set up after load", function() {
    var toggler = $(
    "<section data-ur-set='toggler'>" +
    "<a data-ur-toggler-component='button'></a>" +
    "<div data-ur-toggler-component='content'></div>" +
    "</section>");
    $("body").append(toggler);
    toggler.Uranium();
    toggler.find("a").click();
    expect(toggler.find("a").attr("data-ur-state")).to.equal("enabled");
  });

  describe("toggler", function() {
    it("should work");
  });
  describe("tabs", function() {
    it("should work");
  });
  describe("carousel", function() {
    it("should work");
    it("should handle click handlers");
    it("should handle image maps");
  });
  describe("zoom", function() {
    it("should work");
  });
});
