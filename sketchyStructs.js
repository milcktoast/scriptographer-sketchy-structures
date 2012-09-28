// Sketchy Structures r2.1 : 2011.08.20
// 
// Create whimsical scenes reminiscent of structural systems.
// 
// Select one or more paths, generate self-referential lines within the existing paths
// or add points to the system via mouse input.
// 
// Author: Jay Weeks [jayweeks.com]
// Platform: Scriptographer [scriptographer.org]

( function () {

  // Default settings
  var divo = ["Length", "Number"];
  var ocyo = ["Group", "Path"];
  var dvls = {
    minLength : 0,
    maxLength : 100,
    minStroke : 0.05,
    maxStroke : 0.1,

    opacity : 0.6,
    opctyGrp : ocyo[1],

    divNum : 10,
    divBy : divo[0],

    logPts : true,
    selfRef : true
  };
  var msch = [];

  // Map value to new range
  function mapVals( v, from0, from1, to0, to1 ) {
    return to0 + (to1 - to0) * ((v - from0) / (from1 - from0));
  }

  // Iterate through two sets of points, connecting each with a path
  // within a user-defined minimum and maximum length.
  function drawPaths( ptst1, ptst2, self ) {
    var cpt1, cpt2, dstp, npth, pgrp;
    var ogrp = dvls.opctyGrp == ocyo[0];
    var minl = dvls.minLength;
    var maxl = dvls.maxLength;
    var mins = dvls.minStroke;
    var maxs = dvls.maxStroke;
    var npths = [];

    var i, j;
    var il = ptst1.length;
    var jl = ptst2.length;

    for ( i = 0; i < il; i++ ) {
      cpt1 = ptst1[i];

      for ( j = self ? i + 1 : 0; j < jl; j++ ) {
        cpt2 = ptst2[j];
        dstp = (cpt1 - cpt2).length;

        if ( dstp > minl && dstp < maxl ) {
          npth = new Path.Line( cpt1, cpt2 );
          npth.strokeWidth = mapVals( dstp, minl, maxl, mins, maxs );
          if( !ogrp ) npth.opacity = dvls.opacity;
          npths.push( npth );
        }
      }
    }

    pgrp = new Group( npths );
    if ( ogrp ) {
      pgrp.opacity = dvls.opacity;
    }
  }

  // Divide paths into equidistant or an equal number of points:
  // returns either a single array of all points or groups points by parent path.
  function dividePaths( paths, wrap ) {
    var cpth, evll, pthl, nwpt, ppts, dvln;
    var dvtp = dvls.divBy == divo[0];
    var npts = [];

    for ( var i = 0, il = paths.length; i < il; i++ ) {
      cpth = paths[i];
      evll = 0;
      pthl = cpth.length;
      dvln = dvtp ? dvls.divNum : pthl / dvls.divNum;
      ppts = [];

      while ( evll <= pthl ) {
        if ( evll > pthl ) {
          break;
        }

        nwpt = cpth.getPoint( evll );
        if ( nwpt ) {
          ppts.push( nwpt );
        }
        evll += dvln;
      }

      if( wrap ) npts.push( ppts );
      else npts = npts.concat( ppts );
    }

    return npts;
  }

  // Connect selected paths with mouse coordinates
  function handleMouse( event ) {
    var dpts;
    var sltd = document.getItems({ type: Path, selected: true });
    var mspt = event.point;

    if ( sltd.length > 0 || dvls.logPts ) {
      dpts = dividePaths( sltd, false );

      if ( dvls.logPts ) {
        msch.push( mspt );
        dpts = dpts.concat( msch );
      }

      drawPaths( [mspt], dpts );
    }
  }

  // Cross reference selected paths
  // 0 1 2
  // 1 2 0
  function handleCross() {
    var i, il, j, dpts, dpths;

    dpths = document.getItems({ type: Path, selected: true });
    if ( dpths.length > 0 ) {
      dpts = dividePaths( dpths, true );
    }

    il = dpths.length;
    if ( il > 1 ) {
      for ( i = 0; i < il; i++ ) {
        if ( i < il - 1 ) {
          j = i + 1;
        } else if ( il != 2 ) {
          j = 0;
        } else {
          break;
        }

        drawPaths( dpts[i], dpts[j] );
      }
    }
    if ( il > 0 && dvls.selfRef ) {
      for ( i = 0; i < il; i++ ) {
        drawPaths( dpts[i], dpts[i], true );
      }
    }
  }

  // Scriptographer UI / Event handlers
  var sscmp = {
    r1: { label: 'Path Length', type: 'ruler' },

    minLength: {
      type: 'number',
      units: 'point',
      increment: 10,
      label: 'Min :',
      value: dvls.minLength
    },

    maxLength: {
      type: 'number',
      units: 'point',
      increment: 10,
      label: 'Max :',
      value: dvls.maxLength
    },

    r2: { label: 'Stroke Weight', type: 'ruler' },

    minStroke: {
      type: 'number',
      units: 'point',
      increment: 0.05,
      label: 'Min :',
      value: dvls.minStroke
    },

    maxStroke: {
      type: 'number',
      units: 'point',
      increment: 0.05,
      label: 'Max :',
      value: dvls.maxStroke
    },

    r3: { label: 'Path Opacity', type: 'ruler' },

    opacity: {
      type: 'slider', 
      label: 'Value :',
      value: dvls.opacity, range: [0, 1]
    },

    opctyGrp: {
      type: 'list', 
      label: 'Set By :',
      value: dvls.opctyGrp,
      options: ocyo
    },

    r4: { label: 'Path Divisions', type: 'ruler' },

    divNum : {
      type: 'number',
      label: 'Amount :',
      steppers: true,
      value: dvls.divNum
    },

    divBy : {
      type: 'list',
      label: 'Divide Path By :',
      value: dvls.divBy,
      options: divo
    },

    r5: { label: 'Mouse Input', type: 'ruler' },

    logPts : {
      type: 'boolean',
      label: 'Cache Input Points :',
      value: dvls.logPts
    },

    clearCache : {
      type: 'button',
      label: 'Point Cache :',
      value: 'Empty',
      onClick: function() {
        msch = [];
      }
    },

    r6: { label: 'Cross Reference Existing Geometry', type: 'ruler' },

    selfRef : {
      type: 'boolean',
      label: 'Self Referential :',
      value: dvls.selfRef
    },

    crosser : {
      type: 'button',
      label: 'Generate Paths :',
      value: 'Execute',
      onClick: handleCross
    }
  };

  new Palette( 'Sketchy Structures', sscmp, dvls );
  onMouseDown = onMouseDrag = handleMouse;

// fin :)
}() );