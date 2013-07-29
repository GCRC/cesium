/*global defineSuite*/
defineSuite([
         'Core/PolylinePipeline',
         'Core/Cartesian3',
         'Core/Math',
         'Core/Cartographic',
         'Core/Ellipsoid',
         'Core/Transforms'
     ], function(
         PolylinePipeline,
         Cartesian3,
         CesiumMath,
         Cartographic,
         Ellipsoid,
         Transforms) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('wrapLongitude', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var p1 = new Cartographic.fromDegrees(-75.163789, 39.952335);      // Philadelphia, PA
        var p2 = new Cartographic.fromDegrees(-80.2264393, 25.7889689);    // Miami, FL
        var positions = [ellipsoid.cartographicToCartesian(p1),
                         ellipsoid.cartographicToCartesian(p2)];
        var segments = PolylinePipeline.wrapLongitude(positions);
        expect(segments.lengths.length).toEqual(1);
        expect(segments.lengths[0]).toEqual(2);
    });

    it('wrapLongitude breaks polyline into segments', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var p1 = new Cartographic.fromDegrees(-179.0, 39.0);
        var p2 = new Cartographic.fromDegrees(2.0, 25.0);
        var positions = [ellipsoid.cartographicToCartesian(p1),
                         ellipsoid.cartographicToCartesian(p2)];
        var segments = PolylinePipeline.wrapLongitude(positions);
        expect(segments.lengths.length).toEqual(2);
        expect(segments.lengths[0]).toEqual(2);
        expect(segments.lengths[1]).toEqual(2);
    });

    it('wrapLongitude breaks polyline into segments with model matrix', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var center = ellipsoid.cartographicToCartesian(new Cartographic.fromDegrees(-179.0, 39.0));
        var matrix = Transforms.eastNorthUpToFixedFrame(center, ellipsoid);

        var positions = [ new Cartesian3(0.0, 0.0, 0.0),
                          new Cartesian3(0.0, 100000000.0, 0.0)];
        var segments = PolylinePipeline.wrapLongitude(positions, matrix);
        expect(segments.lengths.length).toEqual(2);
        expect(segments.lengths[0]).toEqual(2);
        expect(segments.lengths[1]).toEqual(2);
    });

    it('removeDuplicates to return one positions', function() {
        var positions = [Cartesian3.ZERO];
        var nonDuplicatePositions = PolylinePipeline.removeDuplicates(positions);
        expect(nonDuplicatePositions).not.toBe(positions);
        expect(nonDuplicatePositions).toEqual(positions);
    });

    it('removeDuplicates to remove duplicates', function() {
        var positions = [
            new Cartesian3(1.0, 1.0, 1.0),
            new Cartesian3(1.0, 1.0, 1.0),
            new Cartesian3(1.0, 1.0, 1.0),
            new Cartesian3(1.0, 1.0, 1.0),
            new Cartesian3(2.0, 2.0, 2.0),
            new Cartesian3(3.0, 3.0, 3.0),
            new Cartesian3(3.0, 3.0, 3.0)];
        var expectedPositions = [
            new Cartesian3(1.0, 1.0, 1.0),
            new Cartesian3(2.0, 2.0, 2.0),
            new Cartesian3(3.0, 3.0, 3.0)];
        var nonDuplicatePositions = PolylinePipeline.removeDuplicates(positions);
        expect(nonDuplicatePositions).not.toBe(expectedPositions);
        expect(nonDuplicatePositions).toEqual(expectedPositions);
    });

    it('removeDuplicates throws without positions', function() {
        expect(function() {
            PolylinePipeline.removeDuplicates();
        }).toThrow();
    });

    it('scaleToSurface throws without positions', function() {
        expect(function() {
            PolylinePipeline.scaleToSurface();
        }).toThrow();
    });

    it('scaleToSurface subdivides in half', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var p1 = ellipsoid.cartographicToCartesian(new Cartographic.fromDegrees(0, 0));
        var p2 = ellipsoid.cartographicToCartesian(new Cartographic.fromDegrees(90, 0));
        var p3 = ellipsoid.cartographicToCartesian(new Cartographic.fromDegrees(45, 0));
        var positions = [p1, p2];

        var newPositions = PolylinePipeline.scaleToSurface(positions, CesiumMath.PI_OVER_TWO/2, ellipsoid);

        expect(newPositions.length).toEqual(3);
        var p1n = newPositions[0];
        var p3n = newPositions[1];
        var p2n = newPositions[2];
        expect(p1.equalsEpsilon(p1n, CesiumMath.EPSILON4)).toEqual(true);
        expect(p2.equalsEpsilon(p2n, CesiumMath.EPSILON4)).toEqual(true);
        expect(p3.equalsEpsilon(p3n, CesiumMath.EPSILON4)).toEqual(true);
    });
});