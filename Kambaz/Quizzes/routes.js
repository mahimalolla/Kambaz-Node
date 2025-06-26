// 🚨 EMERGENCY ROUTE FIXES - Replace your publish/update routes with these

// ================================
// BULLETPROOF PUBLISH/UNPUBLISH ROUTE
// ================================

app.patch("/api/courses/:courseId/quizzes/:quizId/publish", async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    const { published } = req.body;
    
    console.log('🚨 EMERGENCY PUBLISH ROUTE:', { quizId, courseId, published });
    
    // Validate inputs
    if (!quizId) {
      console.error('❌ Missing quiz ID');
      return res.status(400).json({ 
        error: "Quiz ID is required",
        received: { quizId, courseId, published }
      });
    }
    
    if (!courseId) {
      console.error('❌ Missing course ID');
      return res.status(400).json({ 
        error: "Course ID is required",
        received: { quizId, courseId, published }
      });
    }
    
    if (typeof published !== 'boolean') {
      console.error('❌ Invalid published value:', published);
      return res.status(400).json({ 
        error: "Published must be true or false",
        received: { quizId, courseId, published }
      });
    }
    
    console.log('✅ Input validation passed');
    
    // Check if quiz exists first
    console.log('🔍 Checking if quiz exists...');
    const existingQuiz = await quizDao.findQuizById(quizId);
    
    if (!existingQuiz) {
      console.error('❌ Quiz not found:', quizId);
      return res.status(404).json({ 
        error: "Quiz not found",
        quizId: quizId,
        courseId: courseId 
      });
    }
    
    console.log('✅ Quiz exists:', existingQuiz.title);
    
    // Verify course ID matches
    if (existingQuiz.courseId !== courseId) {
      console.error('❌ Course ID mismatch:', {
        requested: courseId,
        actual: existingQuiz.courseId
      });
      return res.status(400).json({
        error: "Quiz belongs to a different course",
        requestedCourse: courseId,
        actualCourse: existingQuiz.courseId
      });
    }
    
    console.log('✅ Course ID matches');
    
    // Update the quiz
    console.log('🔄 Updating quiz published status...');
    const updatedQuiz = await quizDao.updateQuiz(quizId, { published });
    
    if (!updatedQuiz) {
      console.error('❌ Quiz update failed - no result returned');
      return res.status(500).json({
        error: "Failed to update quiz",
        message: "Database operation did not return updated quiz"
      });
    }
    
    console.log('✅ Quiz updated successfully:', {
      id: updatedQuiz._id,
      title: updatedQuiz.title,
      published: updatedQuiz.published
    });
    
    res.json(updatedQuiz);
    
  } catch (error) {
    console.error('💥 EMERGENCY ERROR in publish route:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body
    });
    
    res.status(500).json({ 
      error: "Internal server error during quiz publish",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        params: req.params,
        body: req.body
      } : undefined
    });
  }
});

// ================================
// BULLETPROOF UPDATE QUIZ ROUTE
// ================================

app.put("/api/courses/:courseId/quizzes/:quizId", async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    
    console.log('🚨 EMERGENCY UPDATE ROUTE:');
    console.log('📋 Params:', { quizId, courseId });
    console.log('📝 Body keys:', Object.keys(req.body || {}));
    console.log('📄 Body sample:', {
      title: req.body?.title,
      published: req.body?.published,
      questionCount: req.body?.questions?.length || 0
    });
    
    // Validate required parameters
    if (!quizId) {
      console.error('❌ Missing quiz ID');
      return res.status(400).json({ 
        error: "Quiz ID is required",
        received: { quizId, courseId }
      });
    }
    
    if (!courseId) {
      console.error('❌ Missing course ID');
      return res.status(400).json({ 
        error: "Course ID is required",
        received: { quizId, courseId }
      });
    }
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('❌ No update data provided');
      return res.status(400).json({ 
        error: "No update data provided",
        received: req.body
      });
    }
    
    console.log('✅ Input validation passed');
    
    // Check if quiz exists
    console.log('🔍 Checking if quiz exists...');
    const existingQuiz = await quizDao.findQuizById(quizId);
    
    if (!existingQuiz) {
      console.error('❌ Quiz not found:', quizId);
      return res.status(404).json({ 
        error: "Quiz not found",
        quizId: quizId,
        courseId: courseId,
        message: "The quiz you're trying to update doesn't exist"
      });
    }
    
    console.log('✅ Quiz exists:', existingQuiz.title);
    
    // Verify course ID matches
    if (existingQuiz.courseId !== courseId) {
      console.error('❌ Course ID mismatch:', {
        requested: courseId,
        actual: existingQuiz.courseId
      });
      return res.status(400).json({
        error: "Quiz belongs to a different course",
        requestedCourse: courseId,
        actualCourse: existingQuiz.courseId
      });
    }
    
    console.log('✅ Course ID matches');
    
    // Update the quiz
    console.log('🔄 Calling DAO updateQuiz...');
    const updatedQuiz = await quizDao.updateQuiz(quizId, req.body);
    
    if (!updatedQuiz) {
      console.error('❌ DAO returned null');
      return res.status(500).json({ 
        error: "Quiz update failed",
        message: "Database operation did not return updated quiz"
      });
    }
    
    console.log('✅ Quiz updated successfully:', {
      id: updatedQuiz._id,
      title: updatedQuiz.title,
      published: updatedQuiz.published,
      questionCount: updatedQuiz.questions?.length || 0
    });
    
    res.json(updatedQuiz);
    
  } catch (error) {
    console.error('💥 EMERGENCY ERROR in update route:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      bodyKeys: Object.keys(req.body || {})
    });
    
    res.status(500).json({ 
      error: "Internal server error during quiz update",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        params: req.params,
        bodyKeys: Object.keys(req.body || {})
      } : undefined
    });
  }
});

// ================================
// EMERGENCY DATABASE TEST ROUTE
// ================================

app.get("/api/emergency/test-database", async (req, res) => {
  try {
    console.log('🚨 EMERGENCY DATABASE TEST');
    
    const db = mongoose.connection.db;
    
    // Test 1: Database connection
    console.log('🔍 Testing database connection...');
    const pingResult = await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Test 2: List collections
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections found:', collections.map(c => c.name));
    
    // Test 3: Count quizzes
    const quizCount = await db.collection('quizzes').countDocuments();
    console.log('✅ Quiz count:', quizCount);
    
    // Test 4: Get a sample quiz
    const sampleQuiz = await db.collection('quizzes').findOne({});
    console.log('✅ Sample quiz found:', !!sampleQuiz);
    
    // Test 5: Simple update test (if we have a quiz)
    let updateTest = null;
    if (sampleQuiz) {
      try {
        const updateResult = await db.collection('quizzes').updateOne(
          { _id: sampleQuiz._id },
          { $set: { lastTestedAt: new Date().toISOString() } }
        );
        updateTest = {
          success: updateResult.modifiedCount === 1,
          matched: updateResult.matchedCount,
          modified: updateResult.modifiedCount
        };
        console.log('✅ Update test result:', updateTest);
      } catch (updateError) {
        updateTest = {
          success: false,
          error: updateError.message
        };
        console.error('❌ Update test failed:', updateError);
      }
    }
    
    const testResults = {
      status: 'Database tests completed',
      timestamp: new Date().toISOString(),
      tests: {
        connection: {
          success: true,
          ping: pingResult
        },
        collections: {
          success: true,
          count: collections.length,
          names: collections.map(c => c.name)
        },
        quizzes: {
          success: true,
          count: quizCount,
          hasSample: !!sampleQuiz
        },
        update: updateTest
      },
      sampleQuiz: sampleQuiz ? {
        id: sampleQuiz._id,
        title: sampleQuiz.title,
        courseId: sampleQuiz.courseId,
        questionCount: sampleQuiz.questions?.length || 0
      } : null
    };
    
    console.log('🚨 EMERGENCY TEST COMPLETED');
    res.json(testResults);
    
  } catch (error) {
    console.error('💥 EMERGENCY DATABASE TEST FAILED:', error);
    res.status(500).json({
      status: 'Database tests failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// EMERGENCY QUIZ TEST ROUTE
// ================================

app.get("/api/emergency/test-quiz/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    console.log('🚨 EMERGENCY QUIZ TEST for:', quizId);
    
    // Test 1: Find quiz
    console.log('🔍 Testing findQuizById...');
    const quiz = await quizDao.findQuizById(quizId);
    console.log('Quiz found:', !!quiz);
    
    if (!quiz) {
      return res.json({
        status: 'Quiz not found',
        quizId: quizId,
        tests: {
          find: { success: false, message: 'Quiz not found' }
        }
      });
    }
    
    // Test 2: Simple update
    console.log('🔄 Testing simple update...');
    const updateResult = await quizDao.updateQuiz(quizId, {
      testField: 'emergency-test-' + Date.now()
    });
    console.log('Update result:', !!updateResult);
    
    // Test 3: Publish toggle
    console.log('🚀 Testing publish toggle...');
    const publishResult = await quizDao.updateQuiz(quizId, {
      published: !quiz.published
    });
    console.log('Publish result:', !!publishResult);
    
    res.json({
      status: 'Quiz tests completed',
      quizId: quizId,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        published: quiz.published,
        questionCount: quiz.questions?.length || 0
      },
      tests: {
        find: { success: true },
        update: { success: !!updateResult },
        publish: { success: !!publishResult, newStatus: publishResult?.published }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 EMERGENCY QUIZ TEST FAILED:', error);
    res.status(500).json({
      status: 'Quiz tests failed',
      quizId: req.params.quizId,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

console.log('🚨 EMERGENCY ROUTES ADDED!');
