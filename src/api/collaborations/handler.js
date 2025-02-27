class CollaborationsHandler {
  constructor(collaborationsService, playlistService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistService = playlistService;
    this._validator = validator;
    


  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;
    await this._notesService.verifyNoteOwner(playlistId, credentialId);
    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan kolaborasi',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._notesService.verifyNoteOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus kolaborasi',
    });
    response.code(200);
    return response;
  }
}

module.exports = CollaborationsHandler;
